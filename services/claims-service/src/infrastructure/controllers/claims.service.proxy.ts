import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClaimStatus, Role } from '@prisma/client';
import { ClaimsService } from '../../application/services/claims.service';

export interface ClaimAccessContext {
  role: string;
  userId: string;
}

@Injectable()
export class ClaimsServiceProxy {
  constructor(private readonly claimsService: ClaimsService) {}

  async findAll(context: ClaimAccessContext) {
    if (context.role === Role.ADMIN) {
      return this.claimsService.findAll();
    }

    const allClaims = await this.claimsService.findAll();
    return allClaims.filter(c => c.userId === context.userId);
  }

  async findOne(id: string, context: ClaimAccessContext) {
    const claim = await this.claimsService.findOne(id);

    if (!claim) {
      throw new NotFoundException(`Reclamación con ID ${id} no encontrada.`);
    }

    // Regla de Protección: Si es estudiante, solo puede ver la suya
    if (context.role === Role.STUDENT && claim.userId !== context.userId) {
      throw new ForbiddenException('Acceso denegado a la evidencia solicitada');
    }

    return claim;
  }

  async findByStatus(status: ClaimStatus, context: ClaimAccessContext) {
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden filtrar por estado globalmente');
    }
    return this.claimsService.findByStatus(status);
  }

  async findByFoundDateRange(start: Date, end: Date, context: ClaimAccessContext) {
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden filtrar por rango de fecha');
    }
    return this.claimsService.findByFoundDateRange(start, end);
  }
}
