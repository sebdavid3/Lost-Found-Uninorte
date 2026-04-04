import { ClaimVerificationContext } from './claim-verification.types';

export abstract class BaseClaimHandler {
  private nextHandler?: BaseClaimHandler;

  setNext(handler: BaseClaimHandler): BaseClaimHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(context: ClaimVerificationContext): Promise<boolean> {
    if (!this.nextHandler) {
      return true;
    }

    return this.nextHandler.handle(context);
  }
}
