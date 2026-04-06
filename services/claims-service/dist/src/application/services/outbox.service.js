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
exports.OutboxService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma.service");
let OutboxService = class OutboxService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async enqueueAuditEvent(tx, eventData) {
        return tx.outboxEvent.create({
            data: {
                topic: 'audit.event.created',
                payload: eventData,
                status: client_1.OutboxStatus.PENDING,
            },
        });
    }
    async reserveBatch(limit = 20) {
        const now = new Date();
        const candidates = await this.prisma.outboxEvent.findMany({
            where: {
                OR: [{ status: client_1.OutboxStatus.PENDING }, { status: client_1.OutboxStatus.FAILED }],
                nextAttemptAt: {
                    lte: now,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
            take: limit,
        });
        const reserved = [];
        for (const event of candidates) {
            const updated = await this.prisma.outboxEvent.updateMany({
                where: {
                    id: event.id,
                    status: event.status,
                },
                data: {
                    status: client_1.OutboxStatus.PROCESSING,
                },
            });
            if (updated.count === 1) {
                reserved.push({
                    ...event,
                    status: client_1.OutboxStatus.PROCESSING,
                });
            }
        }
        return reserved;
    }
    async markPublished(id) {
        return this.prisma.outboxEvent.update({
            where: { id },
            data: {
                status: client_1.OutboxStatus.PUBLISHED,
                publishedAt: new Date(),
                lastError: null,
            },
        });
    }
    async markFailed(id, currentRetryCount, errorMessage) {
        const delayMs = Math.min(30000, 1000 * Math.pow(2, currentRetryCount));
        const nextAttemptAt = new Date(Date.now() + delayMs);
        return this.prisma.outboxEvent.update({
            where: { id },
            data: {
                status: client_1.OutboxStatus.FAILED,
                retryCount: currentRetryCount + 1,
                nextAttemptAt,
                lastError: errorMessage.slice(0, 1000),
            },
        });
    }
};
exports.OutboxService = OutboxService;
exports.OutboxService = OutboxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OutboxService);
//# sourceMappingURL=outbox.service.js.map