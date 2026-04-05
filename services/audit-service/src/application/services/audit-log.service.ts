import { Injectable, Inject } from '@nestjs/common';
import { AuditLogFactory, AuditEventDto } from '../../domain/factories/audit-log.factory';
import { AUDIT_LOG_REPOSITORY } from '../../domain/ports/audit-log.repository';
import type { AuditLogRepository } from '../../domain/ports/audit-log.repository';
import { AuditLogEntryProps, AuditAction } from '../../domain/entities/audit-log-entry.entity';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogFactory: AuditLogFactory,
    @Inject(AUDIT_LOG_REPOSITORY) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async processAuditEvent(eventData: AuditEventDto): Promise<void> {
    // RESOLUTION TO RACE CONDITIONS: Use an interactive transaction with SELECT FOR UPDATE
    await this.prisma.$transaction(async (tx) => {
      // Lock the last row to prevent other concurrent processes from reading the same previousHash
      const lastEntries = await tx.$queryRaw<{ hash: string }[]>`
        SELECT hash FROM "AuditLog"
        ORDER BY timestamp DESC
        LIMIT 1
        FOR UPDATE
      `;

      const previousHash = lastEntries.length > 0 ? lastEntries[0].hash : null;

      // Delegate creation and hashing to our Factory
      const entryProps = this.auditLogFactory.create(eventData, previousHash);

      // We use the raw Prisma client in the transaction context.
      // Note: Ideally, this transaction object would be passed down to the repository,
      // but for simplicity and to guarantee the lock works in the same connection context:
      await tx.auditLog.create({
        data: {
          id: entryProps.id,
          action: entryProps.action,
          entityType: entryProps.entityType,
          entityId: entryProps.entityId,
          actorId: entryProps.actorId,
          actorRole: entryProps.actorRole,
          ipAddress: entryProps.ipAddress,
          previousHash: entryProps.previousHash,
          hash: entryProps.hash,
          payload: entryProps.payload as any,
          result: entryProps.result,
          details: entryProps.details,
          timestamp: entryProps.timestamp,
        },
      });
    });
  }

  async getAllLogs(page = 1, limit = 50): Promise<AuditLogEntryProps[]> {
    return this.auditLogRepository.findAll(page, limit);
  }

  async getEntityHistory(entityId: string): Promise<AuditLogEntryProps[]> {
    return this.auditLogRepository.findByEntityId(entityId);
  }

  async getActorHistory(actorId: string): Promise<AuditLogEntryProps[]> {
    return this.auditLogRepository.findByActorId(actorId);
  }

  async getActionsByType(action: AuditAction): Promise<AuditLogEntryProps[]> {
    return this.auditLogRepository.findByAction(action);
  }

  async getByDateRange(start: Date, end: Date): Promise<AuditLogEntryProps[]> {
    return this.auditLogRepository.findByDateRange(start, end);
  }

  async verifyIntegrity(): Promise<{ isValid: boolean; brokenAt: string | null }> {
    const entries = await this.auditLogRepository.findAllOrdered();
    if (entries.length === 0) return { isValid: true, brokenAt: null };

    // Validar genesis block
    if (entries[0].previousHash !== null) {
      return { isValid: false, brokenAt: entries[0].id };
    }

    // Reconstruir hash para el registro actual usando la factory
    // para asegurar que el contenido coincide con el hash persistido
    for (let i = 0; i < entries.length; i++) {
        const current = entries[i];
        
        // Verifica si el hash actual coincide con lo calculado
        const recalculated = this.auditLogFactory.create({
            action: current.action as any,
            entityType: current.entityType as any,
            entityId: current.entityId,
            actorId: current.actorId,
            actorRole: current.actorRole,
            ipAddress: current.ipAddress,
            payload: current.payload,
            result: current.result as any,
            details: current.details || undefined,
        }, current.previousHash);

        // Necesitamos sobreescribir timestamp y id para hash exacto
        const content = JSON.stringify({
            action: current.action,
            entityId: current.entityId,
            actorId: current.actorId,
            timestamp: current.timestamp.toISOString(),
            payload: current.payload,
            previousHash: current.previousHash,
        });
        const crypto = require('crypto');
        const trueHash = crypto.createHash('sha256').update(content).digest('hex');

        if (trueHash !== current.hash) {
            return { isValid: false, brokenAt: current.id };
        }

        // Verifica cadena con anterior
        if (i > 0) {
            const previous = entries[i - 1];
            if (current.previousHash !== previous.hash) {
                return { isValid: false, brokenAt: current.id };
            }
        }
    }

    return { isValid: true, brokenAt: null };
  }
}
