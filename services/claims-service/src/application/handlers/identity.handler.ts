import { PrismaService } from '../../infrastructure/prisma.service';
import { ClaimVerificationException } from './claim-verification.exception';
import { BaseClaimHandler } from './base-claim.handler';
import { ClaimVerificationContext } from './claim-verification.types';

export class IdentityHandler extends BaseClaimHandler {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async handle(context: ClaimVerificationContext): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: context.claim.userId },
    });

    if (!user) {
      throw new ClaimVerificationException(
        'IdentityHandler',
        `El usuario con ID ${context.claim.userId} no existe en los registros oficiales.`,
      );
    }

    return super.handle(context);
  }
}
