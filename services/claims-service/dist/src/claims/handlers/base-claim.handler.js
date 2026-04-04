"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClaimHandler = void 0;
class BaseClaimHandler {
    nextHandler;
    setNext(handler) {
        this.nextHandler = handler;
        return handler;
    }
    async handle(context) {
        if (!this.nextHandler) {
            return true;
        }
        return this.nextHandler.handle(context);
    }
}
exports.BaseClaimHandler = BaseClaimHandler;
//# sourceMappingURL=base-claim.handler.js.map