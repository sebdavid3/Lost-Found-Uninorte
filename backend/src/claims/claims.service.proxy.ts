import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ClaimStatus, Role } from '@prisma/client';
import { ClaimsService } from './claims.service';

export interface ClaimAccessContext {
  userId: string;
  role: Role;
}

@Injectable()
export class ClaimsServiceProxy {
  private readonly logger = new Logger(ClaimsServiceProxy.name);

  constructor(private readonly claimsService: ClaimsService) {}

  async findAll(context: ClaimAccessContext) {
    const claims = await this.claimsService.findAll();

    if (context.role === Role.ADMIN) {
      claims.forEach(claim => this.logClaimAccess(claim.id));
      return claims;
    }

    const ownClaims = claims.filter(claim => claim.userId === context.userId);
    ownClaims.forEach(claim => this.logClaimAccess(claim.id));
    return ownClaims;
  }

  async findOne(id: string, context: ClaimAccessContext) {
    const claim = await this.claimsService.findOne(id);
    if (!claim) return claim;

    if (context.role === Role.ADMIN) {
      this.logClaimAccess(claim.id);
      return claim;
    }

    if (claim.userId !== context.userId) {
      throw new ForbiddenException('Acceso denegado a la evidencia solicitada');
    }

    this.logClaimAccess(claim.id);
    return claim;
  }

  async findByStatus(status: ClaimStatus, context: ClaimAccessContext) {
    this.ensureAdmin(context);
    const claims = await this.claimsService.findByStatus(status);
    claims.forEach(claim => this.logClaimAccess(claim.id));
    return claims;
  }

  async findByFoundDateRange(start: Date, end: Date, context: ClaimAccessContext) {
    this.ensureAdmin(context);
    const claims = await this.claimsService.findByFoundDateRange(start, end);
    claims.forEach(claim => this.logClaimAccess(claim.id));
    return claims;
  }

  private ensureAdmin(context: ClaimAccessContext) {
    if (context.role !== Role.ADMIN) {
      throw new ForbiddenException('Acceso denegado a la evidencia solicitada');
    }
  }

  private logClaimAccess(claimId: string) {
    this.logger.log(`ACCESO A DATOS ACCESIBLES DE CLAIM: ${claimId}`);
  }
}