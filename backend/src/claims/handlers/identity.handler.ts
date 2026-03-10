import { PrismaService } from '../../prisma/prisma.service';
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
        'No existe un usuario activo asociado a la reclamación.',
      );
    }

    if (user.role !== context.claim.user.role) {
      throw new ClaimVerificationException(
        'IdentityHandler',
        'El rol del usuario asociado no es consistente para la verificación.',
      );
    }

    return super.handle(context);
  }
}
