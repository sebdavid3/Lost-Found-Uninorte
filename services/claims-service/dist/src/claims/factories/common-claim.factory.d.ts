import { ClaimFactory, ValidationResult } from './claim.factory';
import { EvidenceDto } from '../dto/create-claim.dto';
export declare class CommonClaimFactory implements ClaimFactory {
    validateEvidences(evidences: EvidenceDto[]): ValidationResult;
}
