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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const claims_service_1 = require("../../application/services/claims.service");
const create_claim_dto_1 = require("../../application/dto/create-claim.dto");
const update_claim_dto_1 = require("../../application/dto/update-claim.dto");
const claims_service_proxy_1 = require("./claims.service.proxy");
const prisma_service_1 = require("../prisma.service");
const identity_handler_1 = require("../../application/handlers/identity.handler");
const availability_handler_1 = require("../../application/handlers/availability.handler");
const evidence_match_handler_1 = require("../../application/handlers/evidence-match.handler");
const claim_verification_exception_1 = require("../../application/handlers/claim-verification.exception");
const claim_element_1 = require("../../application/visitors/elements/claim.element");
const audit_visitor_1 = require("../../application/visitors/audit.visitor");
const text_similarity_visitor_1 = require("../../application/visitors/text-similarity.visitor");
const audit_action_decorator_1 = require("../../application/decorators/audit-action.decorator");
const outbox_service_1 = require("../../application/services/outbox.service");
let ClaimsController = class ClaimsController {
    claimsService;
    claimsServiceProxy;
    prisma;
    outboxService;
    constructor(claimsService, claimsServiceProxy, prisma, outboxService) {
        this.claimsService = claimsService;
        this.claimsServiceProxy = claimsServiceProxy;
        this.prisma = prisma;
        this.outboxService = outboxService;
    }
    create(createClaimDto, request) {
        return this.claimsService.create(createClaimDto, this.getAuditContextFromRequest(request));
    }
    findAll(request) {
        const context = this.getContextFromRequest(request);
        return this.claimsServiceProxy.findAll(context);
    }
    findByStatus(request, status) {
        const context = this.getContextFromRequest(request);
        const normalizedStatus = this.parseClaimStatus(status);
        return this.claimsServiceProxy.findByStatus(normalizedStatus, context);
    }
    findByDateRange(request, start, end) {
        const context = this.getContextFromRequest(request);
        const { parsedStart, parsedEnd } = this.parseDateRange(start, end);
        return this.claimsServiceProxy.findByFoundDateRange(parsedStart, parsedEnd, context);
    }
    findOne(id, request) {
        const context = this.getContextFromRequest(request);
        return this.claimsServiceProxy.findOne(id, context);
    }
    update(id, updateClaimDto, request) {
        return this.claimsService.update(id, updateClaimDto, this.getAuditContextFromRequest(request));
    }
    remove(id, request) {
        return this.claimsService.remove(id, this.getAuditContextFromRequest(request));
    }
    async verify(id, request) {
        const context = this.getContextFromRequest(request);
        if (context.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Acceso denegado a la evidencia solicitada');
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
            throw new common_1.NotFoundException(`Reclamación con ID ${id} no encontrada.`);
        }
        if (claim.status !== client_1.ClaimStatus.PENDING) {
            throw new common_1.BadRequestException('Solo se pueden verificar reclamaciones en estado PENDING.');
        }
        const identityHandler = new identity_handler_1.IdentityHandler(this.prisma);
        const availabilityHandler = new availability_handler_1.AvailabilityHandler(this.prisma);
        const evidenceMatchHandler = new evidence_match_handler_1.EvidenceMatchHandler();
        identityHandler.setNext(availabilityHandler).setNext(evidenceMatchHandler);
        try {
            await identityHandler.handle({ claim });
            const actorContext = this.getAuditContextFromRequest(request);
            const approvedClaim = await this.prisma.$transaction(async (tx) => {
                const updated = await tx.claim.update({
                    where: { id },
                    data: {
                        status: client_1.ClaimStatus.APPROVED,
                        rejectionReason: null,
                    },
                    include: {
                        user: true,
                        object: true,
                        evidences: true,
                    },
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
            return {
                message: 'Reclamación verificada exitosamente y aprobada.',
                claim: approvedClaim,
            };
        }
        catch (error) {
            const rejectionDetails = this.getRejectionDetails(error);
            const actorContext = this.getAuditContextFromRequest(request);
            const rejectedClaim = await this.prisma.$transaction(async (tx) => {
                const updated = await tx.claim.update({
                    where: { id },
                    data: {
                        status: client_1.ClaimStatus.REJECTED,
                        rejectionReason: rejectionDetails.reason,
                    },
                });
                await this.outboxService.enqueueAuditEvent(tx, {
                    action: 'CLAIM_VERIFIED',
                    entityType: 'CLAIM',
                    entityId: updated.id,
                    actorId: actorContext.actorId,
                    actorRole: actorContext.actorRole,
                    ipAddress: actorContext.ipAddress,
                    payload: {
                        claim: updated,
                        rejection: rejectionDetails,
                    },
                    result: 'FAILURE',
                    details: rejectionDetails.reason,
                });
                return updated;
            });
            throw new common_1.HttpException({
                message: 'Reclamación rechazada durante verificación administrativa.',
                eslabonFallido: rejectionDetails.handler,
                motivo: rejectionDetails.reason,
                claimId: rejectedClaim.id,
                status: rejectedClaim.status,
            }, common_1.HttpStatus.CONFLICT);
        }
    }
    getContextFromRequest(request) {
        const roleHeader = request.headers['x-user-role'];
        const userIdHeader = request.headers['x-user-id'];
        const role = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
        const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
        if (!role || (role !== client_1.Role.ADMIN && role !== client_1.Role.STUDENT)) {
            throw new common_1.BadRequestException("Encabezado 'x-user-role' inválido o ausente. Valores permitidos: ADMIN, STUDENT.");
        }
        if (!userId) {
            throw new common_1.BadRequestException("Encabezado 'x-user-id' es obligatorio.");
        }
        return { role, userId };
    }
    parseClaimStatus(status) {
        if (!status || !Object.values(client_1.ClaimStatus).includes(status)) {
            throw new common_1.BadRequestException(`Estado inválido. Valores permitidos: ${Object.values(client_1.ClaimStatus).join(', ')}`);
        }
        return status;
    }
    parseDateRange(start, end) {
        if (!start || !end) {
            throw new common_1.BadRequestException("Parámetros 'start' y 'end' son obligatorios (formato ISO 8601).");
        }
        const parsedStart = new Date(start);
        const parsedEnd = new Date(end);
        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
            throw new common_1.BadRequestException("Parámetros 'start' o 'end' tienen formato inválido.");
        }
        if (parsedStart > parsedEnd) {
            throw new common_1.BadRequestException("El parámetro 'start' no puede ser mayor que 'end'.");
        }
        return { parsedStart, parsedEnd };
    }
    getRejectionDetails(error) {
        if (error instanceof claim_verification_exception_1.ClaimVerificationException) {
            return { handler: error.handler, reason: error.reason };
        }
        if (error instanceof common_1.NotFoundException) {
            return { handler: 'IdentityHandler', reason: 'No se pudo resolver el usuario asociado.' };
        }
        if (error instanceof common_1.BadRequestException) {
            return {
                handler: 'EvidenceMatchHandler',
                reason: 'La verificación falló por datos inválidos en la reclamación.',
            };
        }
        if (error instanceof common_1.InternalServerErrorException) {
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
    getAuditContextFromRequest(request) {
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
    async audit(id, request) {
        const context = this.getContextFromRequest(request);
        if (context.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Solo los administradores pueden ejecutar rutinas de auditoría.');
        }
        const claim = await this.prisma.claim.findUnique({
            where: { id },
            include: {
                evidences: true,
                object: true,
            },
        });
        if (!claim) {
            throw new common_1.NotFoundException(`Reclamación con ID ${id} no encontrada.`);
        }
        const claimElement = new claim_element_1.ClaimElement(claim);
        const auditVisitor = new audit_visitor_1.AuditVisitor();
        const textSimilarityVisitor = new text_similarity_visitor_1.TextSimilarityVisitor();
        claimElement.accept(auditVisitor);
        claimElement.accept(textSimilarityVisitor);
        return {
            message: 'Rutinas de auditoría ejecutadas con éxito vía Patrón Visitor',
            auditReport: auditVisitor.getReport(),
            similarityScores: textSimilarityVisitor.getScores(),
        };
    }
};
exports.ClaimsController = ClaimsController;
__decorate([
    (0, audit_action_decorator_1.AuditAction)('CLAIM_CREATED'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_claim_dto_1.CreateClaimDto, Object]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "create", null);
__decorate([
    (0, audit_action_decorator_1.AuditAction)('CLAIM_LIST_READ'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('filter/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)('filter/date-range'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "findByDateRange", null);
__decorate([
    (0, audit_action_decorator_1.AuditAction)('CLAIM_READ'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "findOne", null);
__decorate([
    (0, audit_action_decorator_1.AuditAction)('CLAIM_UPDATED'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_claim_dto_1.UpdateClaimDto, Object]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "update", null);
__decorate([
    (0, audit_action_decorator_1.AuditAction)('CLAIM_DELETED'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "remove", null);
__decorate([
    (0, audit_action_decorator_1.AuditAction)('CLAIM_VERIFIED'),
    (0, common_1.Post)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClaimsController.prototype, "verify", null);
__decorate([
    (0, common_1.Get)(':id/audit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClaimsController.prototype, "audit", null);
exports.ClaimsController = ClaimsController = __decorate([
    (0, common_1.Controller)('claims'),
    __metadata("design:paramtypes", [claims_service_1.ClaimsService,
        claims_service_proxy_1.ClaimsServiceProxy,
        prisma_service_1.PrismaService,
        outbox_service_1.OutboxService])
], ClaimsController);
//# sourceMappingURL=claims.controller.js.map