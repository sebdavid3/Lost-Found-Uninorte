import { ClaimVerificationContext } from './claim-verification.types';
export declare abstract class BaseClaimHandler {
    private nextHandler?;
    setNext(handler: BaseClaimHandler): BaseClaimHandler;
    handle(context: ClaimVerificationContext): Promise<boolean>;
}
