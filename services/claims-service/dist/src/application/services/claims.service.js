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
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma.service");
const claim_factory_provider_1 = require("../factories/claim-factory.provider");
const outbox_service_1 = require("./outbox.service");
let ClaimsService = class ClaimsService {
    prisma;
    factoryProvider;
    outboxService;
    constructor(prisma, factoryProvider, outboxService) {
        this.prisma = prisma;
        this.factoryProvider = factoryProvider;
        this.outboxService = outboxService;
    }
    async create(createClaimDto, actor) {
        const { userId, objectId, objectCategory, evidences } = createClaimDto;
        const factory = this.factoryProvider.getFactory(objectCategory);
        const validationResult = factory.validateEvidences(evidences);
        if (!validationResult.isValid) {
            throw new common_1.BadRequestException(`Evidencias inválidas para categoría ${objectCategory}: ${validationResult.errors.join(', ')}`);
        }
        const object = await this.prisma.object.findUnique({
            where: { id: objectId },
        });
        if (!object) {
            throw new common_1.NotFoundException(`El objeto con ID ${objectId} no existe.`);
        }
        if (!object.photo || object.photo.trim() === '') {
            throw new common_1.BadRequestException('El objeto no puede recibir reclamaciones porque no tiene una fotografía registrada en el sistema (Norma Institucional).');
        }
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
    findOne(id) {
        return this.prisma.claim.findUnique({
            where: { id },
            include: { evidences: true },
        });
    }
    findByStatus(status) {
        return this.prisma.claim.findMany({
            where: { status },
            include: { evidences: true },
        });
    }
    findByFoundDateRange(start, end) {
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
    async update(id, updateClaimDto, actor) {
        const claim = await this.findOne(id);
        if (!claim)
            throw new common_1.NotFoundException(`Reclamación con ID ${id} no encontrada.`);
        if (claim.status !== 'PENDING') {
            throw new common_1.BadRequestException('Solo se pueden modificar reclamaciones en estado PENDIENTE.');
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
    async remove(id, actor) {
        const claim = await this.findOne(id);
        if (!claim)
            throw new common_1.NotFoundException(`Reclamación con ID ${id} no encontrada.`);
        if (claim.status !== 'PENDING') {
            throw new common_1.BadRequestException('Solo se pueden cancelar reclamaciones en estado PENDIENTE.');
        }
        return this.prisma.$transaction(async (tx) => {
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
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        claim_factory_provider_1.ClaimFactoryProvider,
        outbox_service_1.OutboxService])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map