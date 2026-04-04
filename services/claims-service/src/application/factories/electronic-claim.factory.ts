import { ClaimFactory, ValidationResult } from './claim.factory';
import { EvidenceDto } from '../dto/create-claim.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ElectronicClaimFactory implements ClaimFactory {
  validateEvidences(evidences: EvidenceDto[]): ValidationResult {
    const errors: string[] = [];
    
    // Validar evidencia específica: Serial o Factura
    const hasSerialOrInvoice = evidences.some(
      (evidence) => evidence.type === 'SERIAL_NUMBER' || evidence.type === 'DIGITAL_INVOICE'
    );

    if (!hasSerialOrInvoice) {
      errors.push(
        'Las reclamaciones electrónicas requieren obligatoriamente un "Número de Serie" o "Factura Digital".',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
