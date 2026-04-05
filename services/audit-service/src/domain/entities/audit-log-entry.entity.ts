export interface AuditLogEntryProps {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  actorId: string;
  actorRole: string;
  ipAddress: string;
  previousHash: string | null;     // Hash del registro anterior (chain)
  hash: string;                    // Hash SHA-256 de integridad
  payload: Record<string, unknown>; // Snapshot del estado (request/response)
  result: AuditResult;
  details: string | null;
  timestamp: Date;
}

export enum AuditAction {
  CLAIM_CREATED = 'CLAIM_CREATED',
  CLAIM_UPDATED = 'CLAIM_UPDATED',
  CLAIM_DELETED = 'CLAIM_DELETED',
  CLAIM_VERIFIED = 'CLAIM_VERIFIED',
  CLAIM_APPROVED = 'CLAIM_APPROVED',
  CLAIM_REJECTED = 'CLAIM_REJECTED',
  CLAIM_READ = 'CLAIM_READ',
  CLAIM_LIST_READ = 'CLAIM_LIST_READ',
  ACCESS_DENIED = 'ACCESS_DENIED',
}

export enum AuditEntityType {
  CLAIM = 'CLAIM',
  EVIDENCE = 'EVIDENCE',
  OBJECT = 'OBJECT',
}

export enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  DENIED = 'DENIED',
}
