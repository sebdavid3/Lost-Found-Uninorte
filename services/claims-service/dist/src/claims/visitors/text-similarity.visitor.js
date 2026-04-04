"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSimilarityVisitor = void 0;
class TextSimilarityVisitor {
    similarityScores = [];
    visitClaim(_claimElement) {
    }
    visitEvidence(evidenceElement) {
        const evidenceDesc = evidenceElement.evidence.description;
        const objectDesc = evidenceElement.relatedObject.description;
        if (!evidenceDesc || !objectDesc) {
            this.similarityScores.push({
                evidenceId: evidenceElement.evidence.id,
                type: evidenceElement.evidence.type,
                score: 0,
            });
            return;
        }
        const score = this.calculateSimilarity(evidenceDesc, objectDesc);
        this.similarityScores.push({
            evidenceId: evidenceElement.evidence.id,
            type: evidenceElement.evidence.type,
            score,
        });
    }
    calculateSimilarity(text1, text2) {
        const words1 = new Set(this.tokenize(text1));
        const words2 = new Set(this.tokenize(text2));
        let intersectionCount = 0;
        for (const word of words1) {
            if (words2.has(word)) {
                intersectionCount++;
            }
        }
        const unionCount = new Set([...words1, ...words2]).size;
        if (unionCount === 0)
            return 0;
        const percentage = (intersectionCount / unionCount) * 100;
        return Math.round(percentage * 100) / 100;
    }
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3);
    }
    getScores() {
        return this.similarityScores;
    }
}
exports.TextSimilarityVisitor = TextSimilarityVisitor;
//# sourceMappingURL=text-similarity.visitor.js.map