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
    const now = new Date();

    const candidates = await this.prisma.outboxEvent.findMany({
      where: {
        OR: [{ status: OutboxStatus.PENDING }, { status: OutboxStatus.FAILED }],
        nextAttemptAt: {
          lte: now,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    const reserved = [] as typeof candidates;

    for (const event of candidates) {
      const updated = await this.prisma.outboxEvent.updateMany({
        where: {
          id: event.id,
          status: event.status,
        },
        data: {
          status: OutboxStatus.PROCESSING,
        },
      });

      if (updated.count === 1) {
        reserved.push({
          ...event,
          status: OutboxStatus.PROCESSING,
        });
      }
    }

    return reserved;
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
