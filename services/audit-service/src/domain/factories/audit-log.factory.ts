import { randomUUID, createHash } from 'crypto';
import { AuditLogEntryProps, AuditAction, AuditEntityType, AuditResult } from '../entities/audit-log-entry.entity';

function canonicalizeForHash(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(canonicalizeForHash);
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort();
    const result: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      result[key] = canonicalizeForHash(record[key]);
    }
    return result;
  }

  return value;
}

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
      payload: canonicalizeForHash(entry.payload),
      result: entry.result,
      details: entry.details,
      previousHash: entry.previousHash,
    });
    return createHash('sha256').update(content).digest('hex');
  }
}
