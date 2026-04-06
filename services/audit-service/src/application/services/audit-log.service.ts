import { Injectable, Inject } from '@nestjs/common';
import { AuditLogFactory, AuditEventDto } from '../../domain/factories/audit-log.factory';
import { AUDIT_LOG_REPOSITORY } from '../../domain/ports/audit-log.repository';
import type { AuditLogRepository } from '../../domain/ports/audit-log.repository';
import { AuditLogEntryProps, AuditAction } from '../../domain/entities/audit-log-entry.entity';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly auditLogFactory: AuditLogFactory,
    @Inject(AUDIT_LOG_REPOSITORY) private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async processAuditEvent(eventData: AuditEventDto): Promise<void> {
    await this.auditLogRepository.appendWithChain((previousHash) =>
      this.auditLogFactory.create(eventData, previousHash),
    );
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

    for (let i = 0; i < entries.length; i++) {
      const current = entries[i];
      const recalculated = this.auditLogFactory.recalculateHash({
        id: current.id,
        action: current.action,
        entityType: current.entityType,
        entityId: current.entityId,
        actorId: current.actorId,
        actorRole: current.actorRole,
        ipAddress: current.ipAddress,
        previousHash: current.previousHash,
        payload: current.payload,
        result: current.result,
        details: current.details,
        timestamp: current.timestamp,
      });

      if (recalculated !== current.hash) {
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
