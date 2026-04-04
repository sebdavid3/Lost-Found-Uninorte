import { ClaimElement, EvidenceElement } from './elements/claim.element';
import { IVisitor } from './visitor.interface';
export declare class AuditVisitor implements IVisitor {
    private auditReport;
    visitClaim(claimElement: ClaimElement): void;
    visitEvidence(evidenceElement: EvidenceElement): void;
    getReport(): string;
}
