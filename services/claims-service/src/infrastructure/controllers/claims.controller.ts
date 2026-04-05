import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { ClaimStatus, Role } from '@prisma/client';
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
import { AuditAction } from '../../application/decorators/audit-action.decorator';

@Controller('claims')
export class ClaimsController {
  constructor(
    private readonly claimsService: ClaimsService,
    private readonly claimsServiceProxy: ClaimsServiceProxy,
    private readonly prisma: PrismaService,
  ) {}

  @AuditAction('CLAIM_CREATED')
  @Post()
  create(@Body() createClaimDto: CreateClaimDto) {
    return this.claimsService.create(createClaimDto);
  }

  @AuditAction('CLAIM_LIST_READ')
  @Get()
  findAll(@Req() request: Request) {
    const context = this.getContextFromRequest(request);
    return this.claimsServiceProxy.findAll(context);
  }

  @Get('filter/status')
  findByStatus(@Req() request: Request, @Query('status') status: ClaimStatus) {
    const context = this.getContextFromRequest(request);
    const normalizedStatus = this.parseClaimStatus(status);
    return this.claimsServiceProxy.findByStatus(normalizedStatus, context);
  }

  @Get('filter/date-range')
  findByDateRange(
    @Req() request: Request,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const context = this.getContextFromRequest(request);
    const { parsedStart, parsedEnd } = this.parseDateRange(start, end);
    return this.claimsServiceProxy.findByFoundDateRange(parsedStart, parsedEnd, context);
  }

  @AuditAction('CLAIM_READ')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    const context = this.getContextFromRequest(request);
    return this.claimsServiceProxy.findOne(id, context);
  }

  @AuditAction('CLAIM_UPDATED')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClaimDto: UpdateClaimDto) {
    return this.claimsService.update(id, updateClaimDto);
  }

  @AuditAction('CLAIM_DELETED')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.claimsService.remove(id);
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
      include: {
        user: true,
        object: true,
        evidences: true,
      },
    });

    if (!claim) {
      throw new NotFoundException(`Reclamación con ID ${id} no encontrada.`);
    }

    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException('Solo se pueden verificar reclamaciones en estado PENDING.');
    }

    const identityHandler = new IdentityHandler(this.prisma);
    const availabilityHandler = new AvailabilityHandler(this.prisma);
    const evidenceMatchHandler = new EvidenceMatchHandler();

    identityHandler.setNext(availabilityHandler).setNext(evidenceMatchHandler);

    try {
      await identityHandler.handle({ claim });

      const approvedClaim = await this.prisma.claim.update({
        where: { id },
        data: {
          status: ClaimStatus.APPROVED,
          rejectionReason: null,
        },
        include: {
          user: true,
          object: true,
          evidences: true,
        },
      });

      return {
        message: 'Reclamación verificada exitosamente y aprobada.',
        claim: approvedClaim,
      };
    } catch (error) {
      const rejectionDetails = this.getRejectionDetails(error);

      const rejectedClaim = await this.prisma.claim.update({
        where: { id },
        data: {
          status: ClaimStatus.REJECTED,
          rejectionReason: rejectionDetails.reason,
        },
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

  private getContextFromRequest(request: Request): ClaimAccessContext {
    const roleHeader = request.headers['x-user-role'];
    const userIdHeader = request.headers['x-user-id'];

    const role = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

    if (!role || (role !== Role.ADMIN && role !== Role.STUDENT)) {
      throw new BadRequestException(
        "Encabezado 'x-user-role' inválido o ausente. Valores permitidos: ADMIN, STUDENT.",
      );
    }

    if (!userId) {
      throw new BadRequestException("Encabezado 'x-user-id' es obligatorio.");
    }

    return { role, userId };
  }

  private parseClaimStatus(status: string): ClaimStatus {
    if (!status || !Object.values(ClaimStatus).includes(status as ClaimStatus)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${Object.values(ClaimStatus).join(', ')}`,
      );
    }

    return status as ClaimStatus;
  }

  private parseDateRange(start: string, end: string) {
    if (!start || !end) {
      throw new BadRequestException(
        "Parámetros 'start' y 'end' son obligatorios (formato ISO 8601).",
      );
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
      return {
        handler: 'EvidenceMatchHandler',
        reason: 'La verificación falló por datos inválidos en la reclamación.',
      };
    }

    if (error instanceof InternalServerErrorException) {
      return {
        handler: 'AvailabilityHandler',
        reason: 'Falló la consulta de disponibilidad del objeto.',
      };
    }

    return {
      handler: 'UnknownHandler',
      reason: 'Error inesperado durante la verificación de la reclamación.',
    };
  }

  @Get(':id/audit')
  async audit(@Param('id') id: string, @Req() request: Request) {
    const context = this.getContextFromRequest(request);

    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden ejecutar rutinas de auditoría.');
    }

    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        evidences: true,
        object: true,
      },
    });

    if (!claim) {
      throw new NotFoundException(`Reclamación con ID ${id} no encontrada.`);
    }

    // Inicializamos el elemento padre visitable (La estructura de datos Wrapper)
    const claimElement = new ClaimElement(claim as ClaimWithRelations);

    // Inicializamos nuestros Algoritmos (Visitantes)
    const auditVisitor = new AuditVisitor();
    const textSimilarityVisitor = new TextSimilarityVisitor();

    // Hacemos que la estructura acepte la visita de ambos algoritmos
    claimElement.accept(auditVisitor);
    claimElement.accept(textSimilarityVisitor);

    return {
      message: 'Rutinas de auditoría ejecutadas con éxito vía Patrón Visitor',
      auditReport: auditVisitor.getReport(),
      similarityScores: textSimilarityVisitor.getScores(),
    };
  }
}
