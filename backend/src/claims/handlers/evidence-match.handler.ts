import { ClaimVerificationException } from './claim-verification.exception';
import { BaseClaimHandler } from './base-claim.handler';
import { ClaimVerificationContext } from './claim-verification.types';

export class EvidenceMatchHandler extends BaseClaimHandler {
  async handle(context: ClaimVerificationContext): Promise<boolean> {
    const hasSerialNumberEvidence = context.claim.evidences.some(
      evidence => evidence.type.trim().toUpperCase() === 'SERIAL_NUMBER',
    );

    if (!hasSerialNumberEvidence) {
      throw new ClaimVerificationException(
        'EvidenceMatchHandler',
        "La reclamación no contiene evidencia de tipo 'SERIAL_NUMBER'.",
      );
    }

    return super.handle(context);
  }
}
