import { Claim, Evidence } from '@prisma/client';
import { IVisitable, IVisitor } from '../visitor.interface';
import { ObjectCategory } from '../../../domain/enums';

export interface SimpleObject {
  id: string;
  name: string;
  description: string;
  photo: string;
  category: ObjectCategory;
  location: string;
  foundAt: Date;
}

export type ClaimWithRelations = Claim & {
  evidences: Evidence[];
  object: SimpleObject;
};

export class ClaimElement implements IVisitable {
  constructor(public claim: ClaimWithRelations) {}

  accept(visitor: IVisitor): void {
    visitor.visitClaim(this);
    if (this.claim.evidences && this.claim.evidences.length > 0) {
      for (const evidence of this.claim.evidences) {
        const evidenceElement = new EvidenceElement(evidence, this.claim.object);
        evidenceElement.accept(visitor);
      }
    }
  }
}

export class EvidenceElement implements IVisitable {
  constructor(
    public evidence: Evidence,
    public relatedObject: SimpleObject,
  ) {}

  accept(visitor: IVisitor): void {
    visitor.visitEvidence(this);
  }
}
