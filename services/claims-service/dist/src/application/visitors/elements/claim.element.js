"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceElement = exports.ClaimElement = void 0;
class ClaimElement {
    claim;
    constructor(claim) {
        this.claim = claim;
    }
    accept(visitor) {
        visitor.visitClaim(this);
        if (this.claim.evidences && this.claim.evidences.length > 0) {
            for (const evidence of this.claim.evidences) {
                const evidenceElement = new EvidenceElement(evidence, this.claim.object);
                evidenceElement.accept(visitor);
            }
        }
    }
}
exports.ClaimElement = ClaimElement;
class EvidenceElement {
    evidence;
    relatedObject;
    constructor(evidence, relatedObject) {
        this.evidence = evidence;
        this.relatedObject = relatedObject;
    }
    accept(visitor) {
        visitor.visitEvidence(this);
    }
}
exports.EvidenceElement = EvidenceElement;
//# sourceMappingURL=claim.element.js.map