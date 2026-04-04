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
const prisma_service_1 = require("../prisma/prisma.service");
const claim_factory_provider_1 = require("./factories/claim-factory.provider");
let ClaimsService = class ClaimsService {
    prisma;
    factoryProvider;
    constructor(prisma, factoryProvider) {
        this.prisma = prisma;
        this.factoryProvider = factoryProvider;
    }
    async create(createClaimDto) {
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
        return this.prisma.claim.create({
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
    async update(id, updateClaimDto) {
        const claim = await this.findOne(id);
        if (!claim)
            throw new common_1.NotFoundException(`Reclamación con ID ${id} no encontrada.`);
        if (claim.status !== 'PENDING') {
            throw new common_1.BadRequestException('Solo se pueden modificar reclamaciones en estado PENDIENTE.');
        }
        return this.prisma.claim.update({
            where: { id },
            data: updateClaimDto,
        });
    }
    async remove(id) {
        const claim = await this.findOne(id);
        if (!claim)
            throw new common_1.NotFoundException(`Reclamación con ID ${id} no encontrada.`);
        if (claim.status !== 'PENDING') {
            throw new common_1.BadRequestException('Solo se pueden cancelar reclamaciones en estado PENDIENTE.');
        }
        await this.prisma.evidence.deleteMany({ where: { claimId: id } });
        return this.prisma.claim.delete({
            where: { id },
        });
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        claim_factory_provider_1.ClaimFactoryProvider])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map