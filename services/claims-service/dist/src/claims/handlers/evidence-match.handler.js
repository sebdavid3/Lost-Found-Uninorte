"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceMatchHandler = void 0;
const claim_verification_exception_1 = require("./claim-verification.exception");
const base_claim_handler_1 = require("./base-claim.handler");
class EvidenceMatchHandler extends base_claim_handler_1.BaseClaimHandler {
    async handle(context) {
        const hasSerialNumberEvidence = context.claim.evidences.some(evidence => evidence.type.trim().toUpperCase() === 'SERIAL_NUMBER');
        if (!hasSerialNumberEvidence) {
            throw new claim_verification_exception_1.ClaimVerificationException('EvidenceMatchHandler', "La reclamación no contiene evidencia de tipo 'SERIAL_NUMBER'.");
        }
        return super.handle(context);
    }
}
exports.EvidenceMatchHandler = EvidenceMatchHandler;
//# sourceMappingURL=evidence-match.handler.js.map