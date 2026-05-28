import { Injectable } from '@nestjs/common';
import { Prisma, OutboxStatus } from '@prisma/client';
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

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueueAuditEvent(
    tx: Prisma.TransactionClient,
    eventData: AuditEventPayload,
  ) {
    return tx.outboxEvent.create({
      data: {
        topic: 'audit.event.created',
        payload: eventData as unknown as Prisma.InputJsonValue,
        status: OutboxStatus.PENDING,
      },
    });
  }

  async reserveBatch(limit = 20) {
    return this.prisma.$queryRaw<any[]>`
      UPDATE "OutboxEvent"
      SET status = 'PROCESSING'::"OutboxStatus", "updatedAt" = NOW()
      WHERE id IN (
        SELECT id FROM "OutboxEvent"
        WHERE status IN ('PENDING'::"OutboxStatus", 'FAILED'::"OutboxStatus")
           OR (status = 'PROCESSING'::"OutboxStatus" AND "nextAttemptAt" < NOW() - INTERVAL '5 minutes')
        ORDER BY "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `;
  }

  async markPublished(id: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxStatus.PUBLISHED,
        publishedAt: new Date(),
        lastError: null,
      },
    });
  }

  async markFailed(id: string, currentRetryCount: number, errorMessage: string) {
    const delayMs = Math.min(30000, 1000 * Math.pow(2, currentRetryCount));
    const nextAttemptAt = new Date(Date.now() + delayMs);

    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxStatus.FAILED,
        retryCount: currentRetryCount + 1,
        nextAttemptAt,
        lastError: errorMessage.slice(0, 1000),
      },
    });
  }
}
