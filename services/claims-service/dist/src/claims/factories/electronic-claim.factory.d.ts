import { ClaimFactory, ValidationResult } from './claim.factory';
import { EvidenceDto } from '../dto/create-claim.dto';
export declare class ElectronicClaimFactory implements ClaimFactory {
    validateEvidences(evidences: EvidenceDto[]): ValidationResult;
}
