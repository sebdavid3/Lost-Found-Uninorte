import { PrismaService } from '../../infrastructure/prisma.service';
import { BaseClaimHandler } from './base-claim.handler';
import { ClaimVerificationContext } from './claim-verification.types';
export declare class AvailabilityHandler extends BaseClaimHandler {
    private readonly prisma;
    constructor(prisma: PrismaService);
    handle(context: ClaimVerificationContext): Promise<boolean>;
}
