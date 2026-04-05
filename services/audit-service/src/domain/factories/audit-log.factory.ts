import { randomUUID, createHash } from 'crypto';
import { AuditLogEntryProps, AuditAction, AuditEntityType, AuditResult } from '../entities/audit-log-entry.entity';

export class AuditEventDto {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  actorId: string;
  actorRole: string;
  ipAddress: string;
  payload: Record<string, unknown>;
  result: AuditResult;
  details?: string;
}

export class AuditLogFactory {
  create(eventData: AuditEventDto, previousHash: string | null): AuditLogEntryProps {
    const entry: Omit<AuditLogEntryProps, 'hash'> = {
      id: randomUUID(),
      action: eventData.action,
      entityType: eventData.entityType,
      entityId: eventData.entityId,
      actorId: eventData.actorId,
      actorRole: eventData.actorRole,
      ipAddress: eventData.ipAddress || 'unknown',
      previousHash,
      payload: eventData.payload || {},
      result: eventData.result,
      details: eventData.details || null,
      timestamp: new Date(),
    };

    // Calcular hash SHA-256 del contenido completo garantizando orden consistente
    const hash = this.computeHash(entry);

    return { ...entry, hash };
  }

  recalculateHash(entry: Omit<AuditLogEntryProps, 'hash'>): string {
    return this.computeHash(entry);
  }

  private computeHash(entry: Omit<AuditLogEntryProps, 'hash'>): string {
    const content = JSON.stringify({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      ipAddress: entry.ipAddress,
      timestamp: entry.timestamp.toISOString(),
      payload: entry.payload,
      result: entry.result,
      details: entry.details,
      previousHash: entry.previousHash,
    });
    return createHash('sha256').update(content).digest('hex');
  }
}
