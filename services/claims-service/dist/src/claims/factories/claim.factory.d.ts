import { EvidenceDto } from '../dto/create-claim.dto';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface ClaimFactory {
    validateEvidences(evidences: EvidenceDto[]): ValidationResult;
}
