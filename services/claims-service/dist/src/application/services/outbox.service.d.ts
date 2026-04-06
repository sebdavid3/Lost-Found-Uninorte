import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma.service';
export interface AuditEventPayload {
    action: string;
    entityType: string;
    entityId: string;
    actorId: string;
    actorRole: string;
    ipAddress: string;
    payload: Record<string, unknown>;
    result: 'SUCCESS' | 'FAILURE' | 'DENIED';
    details?: string;
}
export declare class OutboxService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    enqueueAuditEvent(tx: Prisma.TransactionClient, eventData: AuditEventPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OutboxStatus;
        topic: string;
        payload: Prisma.JsonValue;
        retryCount: number;
        nextAttemptAt: Date;
        lastError: string | null;
        publishedAt: Date | null;
    }>;
    reserveBatch(limit?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OutboxStatus;
        topic: string;
        payload: Prisma.JsonValue;
        retryCount: number;
        nextAttemptAt: Date;
        lastError: string | null;
        publishedAt: Date | null;
    }[]>;
    markPublished(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OutboxStatus;
        topic: string;
        payload: Prisma.JsonValue;
        retryCount: number;
        nextAttemptAt: Date;
        lastError: string | null;
        publishedAt: Date | null;
    }>;
    markFailed(id: string, currentRetryCount: number, errorMessage: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OutboxStatus;
        topic: string;
        payload: Prisma.JsonValue;
        retryCount: number;
        nextAttemptAt: Date;
        lastError: string | null;
        publishedAt: Date | null;
    }>;
}
