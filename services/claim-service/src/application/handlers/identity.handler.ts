import { ClaimVerificationException } from './claim-verification.exception';
import { BaseClaimHandler } from './base-claim.handler';
import { ClaimVerificationContext } from './claim-verification.types';
import { UserClientService } from '../../infrastructure/clients/user-client.service';

export class IdentityHandler extends BaseClaimHandler {
  constructor(private readonly userClient: UserClientService) {
    super();
  }

  async handle(context: ClaimVerificationContext): Promise<boolean> {
    const user = await this.userClient.findById(context.claim.userId);

    if (!user) {
      throw new ClaimVerificationException(
        'IdentityHandler',
        `El usuario con ID ${context.claim.userId} no existe en los registros oficiales.`,
      );
    }

    return super.handle(context);
  }
}
