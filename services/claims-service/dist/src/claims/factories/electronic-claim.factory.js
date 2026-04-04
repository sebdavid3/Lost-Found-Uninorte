"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronicClaimFactory = void 0;
const common_1 = require("@nestjs/common");
let ElectronicClaimFactory = class ElectronicClaimFactory {
    validateEvidences(evidences) {
        const errors = [];
        const hasSerialOrInvoice = evidences.some((evidence) => evidence.type === 'SERIAL_NUMBER' || evidence.type === 'DIGITAL_INVOICE');
        if (!hasSerialOrInvoice) {
            errors.push('Las reclamaciones electrónicas requieren obligatoriamente un "Número de Serie" o "Factura Digital".');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
};
exports.ElectronicClaimFactory = ElectronicClaimFactory;
exports.ElectronicClaimFactory = ElectronicClaimFactory = __decorate([
    (0, common_1.Injectable)()
], ElectronicClaimFactory);
//# sourceMappingURL=electronic-claim.factory.js.map