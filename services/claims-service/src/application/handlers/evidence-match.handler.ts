import { ClaimVerificationException } from './claim-verification.exception';
import { BaseClaimHandler } from './base-claim.handler';
import { ClaimVerificationContext } from './claim-verification.types';

const VALID_EVIDENCE_TYPES: Record<string, string[]> = {
  ELECTRONIC: ['SERIAL_NUMBER', 'DIGITAL_INVOICE'],
  DEFAULT: ['DETAILED_DESCRIPTION', 'REFERENCE_PHOTO'],
};

export class EvidenceMatchHandler extends BaseClaimHandler {
  async handle(context: ClaimVerificationContext): Promise<boolean> {
    const category = context.object.category;
    const validTypes = VALID_EVIDENCE_TYPES[category] || VALID_EVIDENCE_TYPES.DEFAULT;

    const hasValidEvidence = context.claim.evidences.some(
      e => validTypes.includes(e.type.trim().toUpperCase())
    );

    if (!hasValidEvidence) {
      throw new ClaimVerificationException(
        'EvidenceMatchHandler',
        `La reclamación no contiene evidencias válidas para la categoría ${category}. Se requiere al menos una de: ${validTypes.join(', ')}.`,
      );
    }

    return super.handle(context);
  }
}
