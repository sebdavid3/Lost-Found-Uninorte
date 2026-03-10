import { Claim, Evidence, Object } from '@prisma/client';
import { IVisitable, IVisitor } from '../visitor.interface';

// Tipo extendido para incluir las relaciones que cargamos en Controller
export type ClaimWithRelations = Claim & {
  evidences: Evidence[];
  object: Object;
};

export class ClaimElement implements IVisitable {
  constructor(public claim: ClaimWithRelations) {}

  accept(visitor: IVisitor): void {
    // 1. Visitamos la reclamación padre
    visitor.visitClaim(this);

    // 2. Visitamos las evidencias hijas (Cascada/Grafo)
    if (this.claim.evidences && this.claim.evidences.length > 0) {
      for (const evidence of this.claim.evidences) {
        // Le pasamos también el objeto de la reclamación para que el visitor de similitud textual tenga con qué comparar.
        const evidenceElement = new EvidenceElement(evidence, this.claim.object);
        evidenceElement.accept(visitor);
      }
    }
  }
}

export class EvidenceElement implements IVisitable {
  constructor(
    public evidence: Evidence,
    public relatedObject: Object,
  ) {}

  accept(visitor: IVisitor): void {
    visitor.visitEvidence(this);
  }
}
