import { ClaimFactory, ValidationResult } from './claim.factory';
import { EvidenceDto } from '../dto/create-claim.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonClaimFactory implements ClaimFactory {
  validateEvidences(evidences: EvidenceDto[]): ValidationResult {
    const errors: string[] = [];

    // Validar evidencia específica: Descripción Detallada y Foto de Referencia
    const hasDetailedDescription = evidences.some(
      (evidence) => evidence.type === 'DETAILED_DESCRIPTION' && evidence.description,
    );

    const hasReferencePhoto = evidences.some(
      (evidence) => evidence.type === 'REFERENCE_PHOTO' && evidence.url,
    );

    if (!hasDetailedDescription || !hasReferencePhoto) {
      errors.push(
        'Las reclamaciones comunes requieren obligatoriamente una "Descripción Detallada" y una "Foto de Referencia".',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
