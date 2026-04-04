import type { ClaimElement, EvidenceElement } from './elements/claim.element';

export interface IVisitor {
  visitClaim(claimElement: ClaimElement): void;
  visitEvidence(evidenceElement: EvidenceElement): void;
}

export interface IVisitable {
  accept(visitor: IVisitor): void;
}
