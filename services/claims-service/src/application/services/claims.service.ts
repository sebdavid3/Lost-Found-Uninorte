import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ClaimStatus } from '@prisma/client';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { PrismaService } from '../../infrastructure/prisma.service';
import { ClaimFactoryProvider } from '../factories/claim-factory.provider';
import { OutboxService } from './outbox.service';

export interface AuditActorContext {
  actorId: string;
  actorRole: string;
  ipAddress: string;
}

@Injectable()
export class ClaimsService {
  constructor(
    private prisma: PrismaService,
    private factoryProvider: ClaimFactoryProvider,
    private outboxService: OutboxService,
  ) {}

  async create(createClaimDto: CreateClaimDto, actor?: AuditActorContext) {
    const { userId, objectId, objectCategory, evidences } = createClaimDto;

    // 1. Obtener la factory correspondiente a la categoría del objeto
    const factory = this.factoryProvider.getFactory(objectCategory);

    // 2. Validar que las evidencias cumplan los requisitos de su categoría
    const validationResult = factory.validateEvidences(evidences);

    if (!validationResult.isValid) {
      throw new BadRequestException(
        `Evidencias inválidas para categoría ${objectCategory}: ${validationResult.errors.join(', ')}`,
      );
    }

    // 3. Obtener el Objeto de la base de datos para Validar la Regla Crítica (Debe tener foto)
    const object = await this.prisma.object.findUnique({
      where: { id: objectId },
    });

    if (!object) {
      throw new NotFoundException(`El objeto con ID ${objectId} no existe.`);
    }

    if (!object.photo || object.photo.trim() === '') {
      throw new BadRequestException(
        'El objeto no puede recibir reclamaciones porque no tiene una fotografía registrada en el sistema (Norma Institucional).',
      );
    }

    // 4. Crear la reclamación y el evento outbox en la misma transacción
    return this.prisma.$transaction(async (tx) => {
      const createdClaim = await tx.claim.create({
        data: {
          userId,
          objectId,
          evidences: {
            create: evidences.map(e => ({
              type: e.type,
              url: e.url,
              description: e.description,
            })),
          },
        },
        include: {
          evidences: true,
        },
      });

      await this.outboxService.enqueueAuditEvent(tx, {
        action: 'CLAIM_CREATED',
        entityType: 'CLAIM',
        entityId: createdClaim.id,
        actorId: actor?.actorId ?? 'system',
        actorRole: actor?.actorRole ?? 'unknown',
        ipAddress: actor?.ipAddress ?? 'unknown',
        payload: { claim: createdClaim },
        result: 'SUCCESS',
      });

      return createdClaim;
    });
  }

  findAll() {
    return this.prisma.claim.findMany({ include: { evidences: true } });
  }

  findOne(id: string) {
    return this.prisma.claim.findUnique({
      where: { id },
      include: { evidences: true },
    });
  }

  findByStatus(status: ClaimStatus) {
    return this.prisma.claim.findMany({
      where: { status },
      include: { evidences: true },
    });
  }

  findByFoundDateRange(start: Date, end: Date) {
    return this.prisma.claim.findMany({
      where: {
        object: {
          foundAt: {
            gte: start,
            lte: end,
          },
        },
      },
      include: {
        evidences: true,
        object: true,
      },
    });
  }

  async update(id: string, updateClaimDto: UpdateClaimDto, actor?: AuditActorContext) {
    const claim = await this.findOne(id);
    if (!claim) throw new NotFoundException(`Reclamación con ID ${id} no encontrada.`);
    if (claim.status !== 'PENDING') {
      throw new BadRequestException('Solo se pueden modificar reclamaciones en estado PENDIENTE.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedClaim = await tx.claim.update({
        where: { id },
        data: updateClaimDto,
      });

      await this.outboxService.enqueueAuditEvent(tx, {
        action: 'CLAIM_UPDATED',
        entityType: 'CLAIM',
        entityId: updatedClaim.id,
        actorId: actor?.actorId ?? 'system',
        actorRole: actor?.actorRole ?? 'unknown',
        ipAddress: actor?.ipAddress ?? 'unknown',
        payload: { claim: updatedClaim },
        result: 'SUCCESS',
      });

      return updatedClaim;
    });
  }

  async remove(id: string, actor?: AuditActorContext) {
    const claim = await this.findOne(id);
    if (!claim) throw new NotFoundException(`Reclamación con ID ${id} no encontrada.`);
    if (claim.status !== 'PENDING') {
      throw new BadRequestException('Solo se pueden cancelar reclamaciones en estado PENDIENTE.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Prisma requiere eliminar las tablas relacionadas primero si no hay Cascade Delete configurado implícitamente
      await tx.evidence.deleteMany({ where: { claimId: id } });

      const deletedClaim = await tx.claim.delete({
        where: { id },
      });

      await this.outboxService.enqueueAuditEvent(tx, {
        action: 'CLAIM_DELETED',
        entityType: 'CLAIM',
        entityId: deletedClaim.id,
        actorId: actor?.actorId ?? 'system',
        actorRole: actor?.actorRole ?? 'unknown',
        ipAddress: actor?.ipAddress ?? 'unknown',
        payload: { claim: deletedClaim },
        result: 'SUCCESS',
      });

      return deletedClaim;
    });
  }
}
