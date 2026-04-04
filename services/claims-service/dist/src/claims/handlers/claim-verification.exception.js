"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimVerificationException = void 0;
class ClaimVerificationException extends Error {
    handler;
    reason;
    constructor(handler, reason) {
        super(reason);
        this.handler = handler;
        this.reason = reason;
    }
}
exports.ClaimVerificationException = ClaimVerificationException;
//# sourceMappingURL=claim-verification.exception.js.map