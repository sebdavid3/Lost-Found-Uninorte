import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ClaimStatus } from '@prisma/client';
import { Role } from '../../domain/enums';
import type { Request } from 'express';
import { ClaimsService } from '../../application/services/claims.service';
import { CreateClaimDto } from '../../application/dto/create-claim.dto';
import { UpdateClaimDto } from '../../application/dto/update-claim.dto';
import { ClaimAccessContext, ClaimsServiceProxy } from './claims.service.proxy';
import { PrismaService } from '../prisma.service';
import { IdentityHandler } from '../../application/handlers/identity.handler';
import { AvailabilityHandler } from '../../application/handlers/availability.handler';
import { EvidenceMatchHandler } from '../../application/handlers/evidence-match.handler';
import { ClaimVerificationException } from '../../application/handlers/claim-verification.exception';
import { ClaimElement, ClaimWithRelations } from '../../application/visitors/elements/claim.element';
import { AuditVisitor } from '../../application/visitors/audit.visitor';
import { TextSimilarityVisitor } from '../../application/visitors/text-similarity.visitor';
import { OutboxService } from '../../application/services/outbox.service';
import { AuditAction } from '../../application/decorators/audit-action.decorator';
import { AntiCorruptionLayerService } from '../acl/anti-corruption-layer.service';
import { UserClientService } from '../clients/user-client.service';
import { ObjectClientService } from '../clients/object-client.service';

@Controller('claims')
export class ClaimsController {
  constructor(
    private readonly claimsService: ClaimsService,
    private readonly claimsServiceProxy: ClaimsServiceProxy,
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly antiCorruptionLayer: AntiCorruptionLayerService,
    private readonly userClient: UserClientService,
    private readonly objectClient: ObjectClientService,
  ) {}

  @AuditAction('CLAIM_CREATED')
  @Post()
  async create(@Body() createClaimDto: CreateClaimDto, @Req() request: Request) {
    const actorContext = this.getAuditContextFromRequest(request);
    if (createClaimDto.userId !== actorContext.actorId) {
      throw new ForbiddenException('No puedes crear un reclamo a nombre de otro usuario');
    }
    const normalizedInput = this.antiCorruptionLayer.normalizeCreateClaimInput(createClaimDto);
    const createdClaim = await this.claimsService.create(normalizedInput, actorContext);
    const enriched = await this.enrichClaim(createdClaim);
    return this.antiCorruptionLayer.toClaimResponse(enriched, Role.STUDENT);
  }

  @AuditAction('CLAIM_LIST_READ')
  @Get()
  async findAll(
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const context = this.getContextFromRequest(request);
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const skip = (pageNum - 1) * limitNum;
    const claims = await this.claimsServiceProxy.findAll(context, skip, limitNum);
    const enriched = await this.enrichClaims(claims);
    return this.antiCorruptionLayer.toClaimsResponse(enriched, context.role as Role);
  }

  @Get('my')
  async findMyClaims(
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const context = this.getContextFromRequest(request);
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const skip = (pageNum - 1) * limitNum;
    const claims = await this.claimsService.findByUser(context.userId, skip, limitNum);
    const enriched = await this.enrichClaims(claims);
    return this.antiCorruptionLayer.toClaimsResponse(enriched, context.role as Role);
  }

  @Get('filter/status')
  async findByStatus(@Req() request: Request, @Query('status') status: ClaimStatus) {
    const context = this.getContextFromRequest(request);
    const normalizedStatus = this.parseClaimStatus(status);
    const claims = await this.claimsServiceProxy.findByStatus(normalizedStatus, context);
    const enriched = await this.enrichClaims(claims);
    return this.antiCorruptionLayer.toClaimsResponse(enriched, context.role as Role);
  }

  @Get('filter/date-range')
  async findByDateRange(
    @Req() request: Request,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const context = this.getContextFromRequest(request);
    const { parsedStart, parsedEnd } = this.parseDateRange(start, end);
    const claims = await this.claimsServiceProxy.findByFoundDateRange(
      parsedStart,
      parsedEnd,
      context,
    );
    const enriched = await this.enrichClaims(claims);
    return this.antiCorruptionLayer.toClaimsResponse(enriched, context.role as Role);
  }

  @AuditAction('CLAIM_READ')
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: Request) {
    const context = this.getContextFromRequest(request);
    const claim = await this.claimsServiceProxy.findOne(id, context);
    const enriched = await this.enrichClaim(claim);
    return this.antiCorruptionLayer.toClaimResponse(enriched, context.role as Role);
  }

  @AuditAction('CLAIM_UPDATED')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateClaimDto: UpdateClaimDto, @Req() request: Request) {
    const context = this.getContextFromRequest(request);
    const actorContext = this.getAuditContextFromRequest(request);
    const updatedClaim = await this.claimsService.update(id, updateClaimDto, actorContext);
    const enriched = await this.enrichClaim(updatedClaim);
    return this.antiCorruptionLayer.toClaimResponse(enriched, context.role as Role);
  }

  @AuditAction('CLAIM_DELETED')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() request: Request) {
    const actorContext = this.getAuditContextFromRequest(request);
    await this.claimsService.remove(id, actorContext);
  }

  @AuditAction('CLAIM_VERIFIED')
  @Post(':id/verify')
  async verify(@Param('id') id: string, @Req() request: Request) {
    const context = this.getContextFromRequest(request);
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException('Acceso denegado a la evidencia solicitada');
    }

    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: { evidences: true },
    });

    if (!claim) {
      throw new NotFoundException(`Reclamación con ID ${id} no encontrada.`);
    }

    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException('Solo se pueden verificar reclamaciones en estado PENDING.');
    }

    const [user, object] = await Promise.all([
      this.userClient.findById(claim.userId),
      this.objectClient.findById(claim.objectId),
    ]);

    if (!user || !object) {
      throw new NotFoundException('No se pudo resolver el usuario u objeto asociado.');
    }

    const identityHandler = new IdentityHandler(this.userClient);
    const availabilityHandler = new AvailabilityHandler(this.prisma);
    const evidenceMatchHandler = new EvidenceMatchHandler();

    identityHandler.setNext(availabilityHandler).setNext(evidenceMatchHandler);

    try {
      await identityHandler.handle({ claim: { ...claim, user, object, evidences: claim.evidences } });

      const actorContext = this.getAuditContextFromRequest(request);

      const approvedClaim = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.claim.update({
          where: { id },
          data: { status: ClaimStatus.APPROVED, rejectionReason: null },
          include: { evidences: true },
        });

        await this.outboxService.enqueueAuditEvent(tx, {
          action: 'CLAIM_VERIFIED',
          entityType: 'CLAIM',
          entityId: updated.id,
          actorId: actorContext.actorId,
          actorRole: actorContext.actorRole,
          ipAddress: actorContext.ipAddress,
          payload: { claim: updated },
          result: 'SUCCESS',
        });

        return updated;
      });

      const enriched = await this.enrichClaim(approvedClaim);
      return {
        message: 'Reclamación verificada exitosamente y aprobada.',
        claim: this.antiCorruptionLayer.toClaimResponse(enriched, context.role),
      };
    } catch (error) {
      const rejectionDetails = this.getRejectionDetails(error);
      const actorContext = this.getAuditContextFromRequest(request);

      const rejectedClaim = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.claim.update({
          where: { id },
          data: { status: ClaimStatus.REJECTED, rejectionReason: rejectionDetails.reason },
        });

        await this.outboxService.enqueueAuditEvent(tx, {
          action: 'CLAIM_VERIFIED',
          entityType: 'CLAIM',
          entityId: updated.id,
          actorId: actorContext.actorId,
          actorRole: actorContext.actorRole,
          ipAddress: actorContext.ipAddress,
          payload: { claim: updated, rejection: rejectionDetails },
          result: 'FAILURE',
          details: rejectionDetails.reason,
        });

        return updated;
      });

      throw new HttpException(
        {
          message: 'Reclamación rechazada durante verificación administrativa.',
          eslabonFallido: rejectionDetails.handler,
          motivo: rejectionDetails.reason,
          claimId: rejectedClaim.id,
          status: rejectedClaim.status,
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  @Get(':id/audit')
  async audit(@Param('id') id: string, @Req() request: Request) {
    const context = this.getContextFromRequest(request);
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden ejecutar rutinas de auditoría.');
    }

    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: { evidences: true },
    });

    if (!claim) {
      throw new NotFoundException(`Reclamación con ID ${id} no encontrada.`);
    }

    const object = await this.objectClient.findById(claim.objectId);
    if (!object) {
      throw new NotFoundException('Objeto asociado no encontrado.');
    }

    const claimElement = new ClaimElement({ ...claim, evidences: claim.evidences, object } as ClaimWithRelations);
    const auditVisitor = new AuditVisitor();
    const textSimilarityVisitor = new TextSimilarityVisitor();

    claimElement.accept(auditVisitor);
    claimElement.accept(textSimilarityVisitor);

    return {
      message: 'Rutinas de auditoría ejecutadas con éxito vía Patrón Visitor',
      auditReport: auditVisitor.getReport(),
      similarityScores: textSimilarityVisitor.getScores(),
    };
  }

  // Helpers

  private async enrichClaim(claim: any): Promise<ClaimWithRelations> {
    if (!claim) return claim;
    const [user, object] = await Promise.all([
      this.userClient.findById(claim.userId),
      this.objectClient.findById(claim.objectId),
    ]);
    return { ...claim, user, object };
  }

  private async enrichClaims(claims: any[]): Promise<ClaimWithRelations[]> {
    const userIds = [...new Set(claims.map(c => c.userId))];
    const objectIds = [...new Set(claims.map(c => c.objectId))];
    const [users, objects] = await Promise.all([
      Promise.all(userIds.map(id => this.userClient.findById(id))),
      Promise.all(objectIds.map(id => this.objectClient.findById(id))),
    ]);
    const userMap = new Map(users.filter(Boolean).map(u => [u.id, u]));
    const objectMap = new Map(objects.filter(Boolean).map(o => [o.id, o]));
    return claims.map(c => ({ ...c, user: userMap.get(c.userId), object: objectMap.get(c.objectId) }));
  }

  private getContextFromRequest(request: Request): ClaimAccessContext {
    const roleHeader = request.headers['x-user-role'];
    const userIdHeader = request.headers['x-user-id'];
    const role = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
    if (!role || (role !== Role.ADMIN && role !== Role.STUDENT)) {
      throw new BadRequestException("Encabezado 'x-user-role' inválido o ausente. Valores permitidos: ADMIN, STUDENT.");
    }
    if (!userId) {
      throw new BadRequestException("Encabezado 'x-user-id' es obligatorio.");
    }
    return { role, userId };
  }

  private parseClaimStatus(status: string): ClaimStatus {
    if (!status || !Object.values(ClaimStatus).includes(status as ClaimStatus)) {
      throw new BadRequestException(`Estado inválido. Valores permitidos: ${Object.values(ClaimStatus).join(', ')}`);
    }
    return status as ClaimStatus;
  }

  private parseDateRange(start: string, end: string) {
    if (!start || !end) {
      throw new BadRequestException("Parámetros 'start' y 'end' son obligatorios (formato ISO 8601).");
    }
    const parsedStart = new Date(start);
    const parsedEnd = new Date(end);
    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
      throw new BadRequestException("Parámetros 'start' o 'end' tienen formato inválido.");
    }
    if (parsedStart > parsedEnd) {
      throw new BadRequestException("El parámetro 'start' no puede ser mayor que 'end'.");
    }
    return { parsedStart, parsedEnd };
  }

  private getRejectionDetails(error: unknown) {
    if (error instanceof ClaimVerificationException) {
      return { handler: error.handler, reason: error.reason };
    }
    if (error instanceof NotFoundException) {
      return { handler: 'IdentityHandler', reason: 'No se pudo resolver el usuario asociado.' };
    }
    if (error instanceof BadRequestException) {
      return { handler: 'EvidenceMatchHandler', reason: 'La verificación falló por datos inválidos en la reclamación.' };
    }
    if (error instanceof InternalServerErrorException) {
      return { handler: 'AvailabilityHandler', reason: 'Falló la consulta de disponibilidad del objeto.' };
    }
    return { handler: 'UnknownHandler', reason: 'Error inesperado durante la verificación de la reclamación.' };
  }

  private getAuditContextFromRequest(request: Request) {
    const userIdHeader = request.headers['x-user-id'];
    const roleHeader = request.headers['x-user-role'];
    const actorId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
    const actorRole = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
    return {
      actorId: actorId ?? 'system',
      actorRole: actorRole ?? 'unknown',
      ipAddress: request.ip || request.connection?.remoteAddress || 'unknown',
    };
  }
}
