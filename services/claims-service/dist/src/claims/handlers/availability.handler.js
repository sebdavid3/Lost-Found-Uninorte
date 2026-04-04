"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityHandler = void 0;
const client_1 = require("@prisma/client");
const claim_verification_exception_1 = require("./claim-verification.exception");
const base_claim_handler_1 = require("./base-claim.handler");
class AvailabilityHandler extends base_claim_handler_1.BaseClaimHandler {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async handle(context) {
        const approvedByOtherUser = await this.prisma.claim.findFirst({
            where: {
                objectId: context.claim.objectId,
                status: client_1.ClaimStatus.APPROVED,
                id: { not: context.claim.id },
                userId: { not: context.claim.userId },
            },
            select: { id: true },
        });
        if (approvedByOtherUser) {
            throw new claim_verification_exception_1.ClaimVerificationException('AvailabilityHandler', 'El objeto ya fue reclamado exitosamente por otra persona.');
        }
        return super.handle(context);
    }
}
exports.AvailabilityHandler = AvailabilityHandler;
//# sourceMappingURL=availability.handler.js.map