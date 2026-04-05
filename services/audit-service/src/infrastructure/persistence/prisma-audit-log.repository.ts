import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuditLogRepository } from '../../domain/ports/audit-log.repository';
import { AuditLogEntryProps, AuditAction } from '../../domain/entities/audit-log-entry.entity';

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async appendWithChain(builder: (previousHash: string | null) => AuditLogEntryProps): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const lastEntries = await tx.$queryRaw<{ hash: string }[]>`
        SELECT hash FROM "AuditLog"
        ORDER BY timestamp DESC
        LIMIT 1
        FOR UPDATE
      `;

      const previousHash = lastEntries.length > 0 ? lastEntries[0].hash : null;
      const entry = builder(previousHash);

      await tx.auditLog.create({
        data: {
          id: entry.id,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          actorId: entry.actorId,
          actorRole: entry.actorRole,
          ipAddress: entry.ipAddress,
          previousHash: entry.previousHash,
          hash: entry.hash,
          payload: entry.payload as any,
          result: entry.result,
          details: entry.details,
          timestamp: entry.timestamp,
        },
      });
    });
  }

  async append(entry: AuditLogEntryProps): Promise<void> {
    // Usually appended in transaction in Service to guarantee atomic lock,
    // but offered here for standard inserts without lock concern.
    await this.prisma.auditLog.create({
      data: {
        id: entry.id,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        ipAddress: entry.ipAddress,
        previousHash: entry.previousHash,
        hash: entry.hash,
        payload: entry.payload as any,
        result: entry.result,
        details: entry.details,
        timestamp: entry.timestamp,
      },
    });
  }

  async findAll(page: number, limit: number): Promise<AuditLogEntryProps[]> {
    const logs = await this.prisma.auditLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
    return logs as unknown as AuditLogEntryProps[];
  }

  async findByEntityId(entityId: string): Promise<AuditLogEntryProps[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { entityId },
      orderBy: { timestamp: 'asc' },
    });
    return logs as unknown as AuditLogEntryProps[];
  }

  async findByActorId(actorId: string): Promise<AuditLogEntryProps[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { timestamp: 'desc' },
    });
    return logs as unknown as AuditLogEntryProps[];
  }

  async findByAction(action: AuditAction): Promise<AuditLogEntryProps[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { timestamp: 'desc' },
    });
    return logs as unknown as AuditLogEntryProps[];
  }

  async findByDateRange(start: Date, end: Date): Promise<AuditLogEntryProps[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { timestamp: 'desc' },
    });
    return logs as unknown as AuditLogEntryProps[];
  }

  async findLastEntry(): Promise<AuditLogEntryProps | null> {
    const log = await this.prisma.auditLog.findFirst({
      orderBy: { timestamp: 'desc' },
    });
    return log ? (log as unknown as AuditLogEntryProps) : null;
  }

  async findAllOrdered(): Promise<AuditLogEntryProps[]> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'asc' },
    });
    return logs as unknown as AuditLogEntryProps[];
  }
}
