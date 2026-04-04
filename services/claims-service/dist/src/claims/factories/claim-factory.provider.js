"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimFactoryProvider = void 0;
const electronic_claim_factory_1 = require("./electronic-claim.factory");
const common_claim_factory_1 = require("./common-claim.factory");
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
let ClaimFactoryProvider = class ClaimFactoryProvider {
    electronicFactory;
    commonFactory;
    constructor(electronicFactory, commonFactory) {
        this.electronicFactory = electronicFactory;
        this.commonFactory = commonFactory;
    }
    getFactory(category) {
        switch (category) {
            case client_1.ObjectCategory.ELECTRONIC:
            case client_1.ObjectCategory.ACCESSORY:
                return this.electronicFactory;
            case client_1.ObjectCategory.COMMON:
            case client_1.ObjectCategory.CLOTHING:
            case client_1.ObjectCategory.STATIONERY:
            case client_1.ObjectCategory.DOCUMENT:
            case client_1.ObjectCategory.OTHER:
                return this.commonFactory;
            default:
                throw new common_1.BadRequestException(`No hay factory definida para la categoría: ${category}`);
        }
    }
};
exports.ClaimFactoryProvider = ClaimFactoryProvider;
exports.ClaimFactoryProvider = ClaimFactoryProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [electronic_claim_factory_1.ElectronicClaimFactory,
        common_claim_factory_1.CommonClaimFactory])
], ClaimFactoryProvider);
//# sourceMappingURL=claim-factory.provider.js.map