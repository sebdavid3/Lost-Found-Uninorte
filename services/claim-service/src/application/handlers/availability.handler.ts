import { ClaimStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma.service';
import { ClaimVerificationException } from './claim-verification.exception';
import { BaseClaimHandler } from './base-claim.handler';
import { ClaimVerificationContext } from './claim-verification.types';

export class AvailabilityHandler extends BaseClaimHandler {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async handle(context: ClaimVerificationContext): Promise<boolean> {
    const approvedByOtherUser = await this.prisma.claim.findFirst({
      where: {
        objectId: context.claim.objectId,
        status: ClaimStatus.APPROVED,
        id: { not: context.claim.id },
        userId: { not: context.claim.userId },
      },
      select: { id: true },
    });

    if (approvedByOtherUser) {
      throw new ClaimVerificationException(
        'AvailabilityHandler',
        'El objeto ya fue reclamado exitosamente por otra persona.',
      );
    }

    return super.handle(context);
  }
}
