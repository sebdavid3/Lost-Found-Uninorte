import { Claim, Evidence, Object } from '@prisma/client';
import { IVisitable, IVisitor } from '../visitor.interface';
export type ClaimWithRelations = Claim & {
    evidences: Evidence[];
    object: Object;
};
export declare class ClaimElement implements IVisitable {
    claim: ClaimWithRelations;
    constructor(claim: ClaimWithRelations);
    accept(visitor: IVisitor): void;
}
export declare class EvidenceElement implements IVisitable {
    evidence: Evidence;
    relatedObject: Object;
    constructor(evidence: Evidence, relatedObject: Object);
    accept(visitor: IVisitor): void;
}
