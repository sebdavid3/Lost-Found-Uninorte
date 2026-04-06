import { AuditAction, AuditLogEntryProps } from '../entities/audit-log-entry.entity';

export const AUDIT_LOG_REPOSITORY = 'AuditLogRepository';

export interface AuditLogRepository {
  append(entry: AuditLogEntryProps): Promise<void>;
  appendWithChain(builder: (previousHash: string | null) => AuditLogEntryProps): Promise<void>;
  findAll(page: number, limit: number): Promise<AuditLogEntryProps[]>;
  findByEntityId(entityId: string): Promise<AuditLogEntryProps[]>;
  findByActorId(actorId: string): Promise<AuditLogEntryProps[]>;
  findByAction(action: AuditAction): Promise<AuditLogEntryProps[]>;
  findByDateRange(start: Date, end: Date): Promise<AuditLogEntryProps[]>;
  findLastEntry(): Promise<AuditLogEntryProps | null>;
  findAllOrdered(): Promise<AuditLogEntryProps[]>; // Para verificar cadena
}
