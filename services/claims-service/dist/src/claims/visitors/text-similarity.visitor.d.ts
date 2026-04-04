import { ClaimElement, EvidenceElement } from './elements/claim.element';
import { IVisitor } from './visitor.interface';
export declare class TextSimilarityVisitor implements IVisitor {
    private similarityScores;
    visitClaim(_claimElement: ClaimElement): void;
    visitEvidence(evidenceElement: EvidenceElement): void;
    private calculateSimilarity;
    private tokenize;
    getScores(): {
        evidenceId: string;
        type: string;
        score: number;
    }[];
}
