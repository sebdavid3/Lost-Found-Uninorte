import { BaseClaimHandler } from './base-claim.handler';
import { ClaimVerificationContext } from './claim-verification.types';
export declare class EvidenceMatchHandler extends BaseClaimHandler {
    handle(context: ClaimVerificationContext): Promise<boolean>;
}
