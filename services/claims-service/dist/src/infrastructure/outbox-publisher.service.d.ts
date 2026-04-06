import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OutboxService } from '../application/services/outbox.service';
export declare class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
    private readonly outboxService;
    private readonly client;
    private readonly logger;
    private timer;
    private isPublishing;
    constructor(outboxService: OutboxService, client: ClientProxy);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private publishPendingEvents;
}
