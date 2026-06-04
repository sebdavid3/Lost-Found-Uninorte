import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ClaimStatus } from '@prisma/client';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { PrismaService } from '../../infrastructure/prisma.service';
import { ClaimFactoryProvider } from '../factories/claim-factory.provider';
import { OutboxService } from './outbox.service';
import { UserClientService } from '../../infrastructure/clients/user-client.service';
import { ObjectClientService } from '../../infrastructure/clients/object-client.service';

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
    private userClient: UserClientService,
    private objectClient: ObjectClientService,
  ) {}

  async create(createClaimDto: CreateClaimDto, actor?: AuditActorContext) {
    const { userId, objectId, evidences, lostLocation } = createClaimDto;

    const userExists = await this.userClient.findById(userId);
    if (!userExists) {
      throw new BadRequestException('El usuario especificado no existe');
    }

    const object = await this.objectClient.findById(objectId);
    if (!object) {
      throw new NotFoundException(`El objeto con ID ${objectId} no existe.`);
    }

    const category = object.category;
    const factory = this.factoryProvider.getFactory(category);
    const validationResult = factory.validateEvidences(evidences);

    if (!validationResult.isValid) {
      throw new BadRequestException(
        `Evidencias inválidas para categoría ${category}: ${validationResult.errors.join(', ')}`,
      );
    }

    if (!object.photo || object.photo.trim() === '') {
      throw new BadRequestException(
        'El objeto no puede recibir reclamaciones porque no tiene una fotografía registrada en el sistema (Norma Institucional).',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const createdClaim = await tx.claim.create({
        data: {
          userId,
          objectId,
          lostLocation,
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

  findAll(skip?: number, take?: number) {
    return this.prisma.claim.findMany({
      skip,
      take,
      include: { evidences: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.claim.findUnique({
      where: { id },
      include: { evidences: true },
    });
  }

  findByUser(userId: string, skip?: number, take?: number) {
    return this.prisma.claim.findMany({
      where: { userId },
      skip,
      take,
      include: { evidences: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByStatus(status: ClaimStatus) {
    return this.prisma.claim.findMany({
      where: { status },
      include: { evidences: true },
    });
  }

  async findByFoundDateRange(start: Date, end: Date) {
    const objectsInRange = await this.objectClient.findByDateRange(start.toISOString(), end.toISOString());
    const objectIds = objectsInRange.map((o: any) => o.id);
    if (objectIds.length === 0) return [];
    return this.prisma.claim.findMany({
      where: { objectId: { in: objectIds } },
      include: { evidences: true },
    });
  }

  async update(id: string, updateClaimDto: UpdateClaimDto, actor?: AuditActorContext) {
    if (!updateClaimDto || Object.keys(updateClaimDto).length === 0) {
      throw new BadRequestException('Debe enviar al menos un campo para actualizar');
    }
    const claim = await this.findOne(id);
    if (!claim) throw new NotFoundException(`Reclamación con ID ${id} no encontrada.`);
    if (actor && actor.actorRole === 'STUDENT' && claim.userId !== actor.actorId) {
      throw new ForbiddenException('No puedes modificar un reclamo que no te pertenece');
    }
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
    if (actor && actor.actorRole === 'STUDENT' && claim.userId !== actor.actorId) {
      throw new ForbiddenException('No puedes modificar un reclamo que no te pertenece');
    }
    if (claim.status !== 'PENDING') {
      throw new BadRequestException('Solo se pueden cancelar reclamaciones en estado PENDIENTE.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.evidence.deleteMany({ where: { claimId: id } });
      const deletedClaim = await tx.claim.delete({ where: { id } });

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
