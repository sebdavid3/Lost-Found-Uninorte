import { ClaimElement, EvidenceElement } from './elements/claim.element';
import { IVisitor } from './visitor.interface';

export class AuditVisitor implements IVisitor {
  private auditReport: string[] = [];

  visitClaim(claimElement: ClaimElement): void {
    const c = claimElement.claim;
    this.auditReport.push('--- INICIO AUDITORÍA DE RECLAMACIÓN ---');
    this.auditReport.push(`ID Reclamación: ${c.id}`);
    this.auditReport.push(`Estado Actual: ${c.status}`);
    this.auditReport.push(`ID Objeto: ${c.objectId}`);
    this.auditReport.push(`Total Evidencias Adjuntas: ${c.evidences.length}`);
    this.auditReport.push(`Fecha de Creación: ${c.createdAt.toISOString()}`);
  }

  visitEvidence(evidenceElement: EvidenceElement): void {
    const e = evidenceElement.evidence;
    this.auditReport.push(`  -> Evidencia [${e.type}]: ${e.description || 'Sin descripción'}`);
    if (e.url) {
      this.auditReport.push(`     URL: ${e.url}`);
    }
  }

  getReport(): string {
    this.auditReport.push('--- FIN DE AUDITORÍA ---');
    return this.auditReport.join('\n');
  }
}
