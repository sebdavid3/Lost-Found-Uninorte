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
var OutboxPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxPublisherService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const outbox_service_1 = require("../application/services/outbox.service");
let OutboxPublisherService = OutboxPublisherService_1 = class OutboxPublisherService {
    outboxService;
    client;
    logger = new common_1.Logger(OutboxPublisherService_1.name);
    timer = null;
    isPublishing = false;
    constructor(outboxService, client) {
        this.outboxService = outboxService;
        this.client = client;
    }
    onModuleInit() {
        this.timer = setInterval(() => {
            void this.publishPendingEvents();
        }, 5000);
    }
    onModuleDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    async publishPendingEvents() {
        if (this.isPublishing) {
            return;
        }
        this.isPublishing = true;
        try {
            const events = await this.outboxService.reserveBatch(20);
            for (const event of events) {
                try {
                    const payload = event.payload;
                    await (0, rxjs_1.firstValueFrom)(this.client.emit(event.topic, payload));
                    await this.outboxService.markPublished(event.id);
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown outbox publish error';
                    await this.outboxService.markFailed(event.id, event.retryCount, message);
                    this.logger.warn(`Failed publishing outbox event ${event.id}. Retry ${event.retryCount + 1}.`);
                }
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Outbox publishing cycle failed: ${message}`);
        }
        finally {
            this.isPublishing = false;
        }
    }
};
exports.OutboxPublisherService = OutboxPublisherService;
exports.OutboxPublisherService = OutboxPublisherService = OutboxPublisherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AUDIT_SERVICE')),
    __metadata("design:paramtypes", [outbox_service_1.OutboxService,
        microservices_1.ClientProxy])
], OutboxPublisherService);
//# sourceMappingURL=outbox-publisher.service.js.map