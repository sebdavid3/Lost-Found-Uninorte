"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityHandler = void 0;
const claim_verification_exception_1 = require("./claim-verification.exception");
const base_claim_handler_1 = require("./base-claim.handler");
class IdentityHandler extends base_claim_handler_1.BaseClaimHandler {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async handle(context) {
        const user = await this.prisma.user.findUnique({
            where: { id: context.claim.userId },
        });
        if (!user) {
            throw new claim_verification_exception_1.ClaimVerificationException('IdentityHandler', 'No existe un usuario activo asociado a la reclamación.');
        }
        if (user.role !== context.claim.user.role) {
            throw new claim_verification_exception_1.ClaimVerificationException('IdentityHandler', 'El rol del usuario asociado no es consistente para la verificación.');
        }
        return super.handle(context);
    }
}
exports.IdentityHandler = IdentityHandler;
//# sourceMappingURL=identity.handler.js.map