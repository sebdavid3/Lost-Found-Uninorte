"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClaimsServiceProxy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsServiceProxy = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const claims_service_1 = require("./claims.service");
let ClaimsServiceProxy = ClaimsServiceProxy_1 = class ClaimsServiceProxy {
    claimsService;
    logger = new common_1.Logger(ClaimsServiceProxy_1.name);
    constructor(claimsService) {
        this.claimsService = claimsService;
    }
    async findAll(context) {
        const claims = await this.claimsService.findAll();
        if (context.role === client_1.Role.ADMIN) {
            claims.forEach(claim => this.logClaimAccess(claim.id));
            return claims;
        }
        const ownClaims = claims.filter(claim => claim.userId === context.userId);
        ownClaims.forEach(claim => this.logClaimAccess(claim.id));
        return ownClaims;
    }
    async findOne(id, context) {
        const claim = await this.claimsService.findOne(id);
        if (!claim)
            return claim;
        if (context.role === client_1.Role.ADMIN) {
            this.logClaimAccess(claim.id);
            return claim;
        }
        if (claim.userId !== context.userId) {
            throw new common_1.ForbiddenException('Acceso denegado a la evidencia solicitada');
        }
        this.logClaimAccess(claim.id);
        return claim;
    }
    async findByStatus(status, context) {
        this.ensureAdmin(context);
        const claims = await this.claimsService.findByStatus(status);
        claims.forEach(claim => this.logClaimAccess(claim.id));
        return claims;
    }
    async findByFoundDateRange(start, end, context) {
        this.ensureAdmin(context);
        const claims = await this.claimsService.findByFoundDateRange(start, end);
        claims.forEach(claim => this.logClaimAccess(claim.id));
        return claims;
    }
    ensureAdmin(context) {
        if (context.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Acceso denegado a la evidencia solicitada');
        }
    }
    logClaimAccess(claimId) {
        this.logger.log(`ACCESO A DATOS ACCESIBLES DE CLAIM: ${claimId}`);
    }
};
exports.ClaimsServiceProxy = ClaimsServiceProxy;
exports.ClaimsServiceProxy = ClaimsServiceProxy = ClaimsServiceProxy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [claims_service_1.ClaimsService])
], ClaimsServiceProxy);
//# sourceMappingURL=claims.service.proxy.js.map