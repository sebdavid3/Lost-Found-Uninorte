import { ClaimElement, EvidenceElement } from './elements/claim.element';
import { IVisitor } from './visitor.interface';

export class TextSimilarityVisitor implements IVisitor {
  // Guardamos las similitudes calculadas para cada evidencia leída
  private similarityScores: Array<{ evidenceId: string; type: string; score: number }> = [];

  // No necesitamos hacer nada con el ClaimPadre aquí
  visitClaim(_claimElement: ClaimElement): void {
    // Implementación vacía intencional
  }

  visitEvidence(evidenceElement: EvidenceElement): void {
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

  // Algoritmo simple de similitud de Jaccard (conteo de palabras comunes / total palabras únicas)
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.tokenize(text1));
    const words2 = new Set(this.tokenize(text2));

    let intersectionCount = 0;
    for (const word of words1) {
      if (words2.has(word)) {
        intersectionCount++;
      }
    }

    const unionCount = new Set([...words1, ...words2]).size;

    if (unionCount === 0) return 0;

    const percentage = (intersectionCount / unionCount) * 100;
    return Math.round(percentage * 100) / 100; // Redondear a 2 decimales
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Quitar puntuación
      .split(/\s+/)
      .filter(w => w.length > 3); // Ignorar conectores cortos (el, la, de, en)
  }

  getScores() {
    return this.similarityScores;
  }
}
