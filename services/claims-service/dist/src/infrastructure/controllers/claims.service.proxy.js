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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsServiceProxy = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const claims_service_1 = require("../../application/services/claims.service");
let ClaimsServiceProxy = class ClaimsServiceProxy {
    claimsService;
    constructor(claimsService) {
        this.claimsService = claimsService;
    }
    async findAll(context) {
        if (context.role === client_1.Role.ADMIN) {
            return this.claimsService.findAll();
        }
        const allClaims = await this.claimsService.findAll();
        return allClaims.filter(c => c.userId === context.userId);
    }
    async findOne(id, context) {
        const claim = await this.claimsService.findOne(id);
        if (!claim) {
            throw new common_1.NotFoundException(`Reclamación con ID ${id} no encontrada.`);
        }
        if (context.role === client_1.Role.STUDENT && claim.userId !== context.userId) {
            throw new common_1.ForbiddenException('Acceso denegado a la evidencia solicitada');
        }
        return claim;
    }
    async findByStatus(status, context) {
        if (context.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Solo administradores pueden filtrar por estado globalmente');
        }
        return this.claimsService.findByStatus(status);
    }
    async findByFoundDateRange(start, end, context) {
        if (context.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Solo administradores pueden filtrar por rango de fecha');
        }
        return this.claimsService.findByFoundDateRange(start, end);
    }
};
exports.ClaimsServiceProxy = ClaimsServiceProxy;
exports.ClaimsServiceProxy = ClaimsServiceProxy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [claims_service_1.ClaimsService])
], ClaimsServiceProxy);
//# sourceMappingURL=claims.service.proxy.js.map