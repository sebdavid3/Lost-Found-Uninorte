"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsModule = void 0;
const common_1 = require("@nestjs/common");
const claims_service_1 = require("./claims.service");
const claims_controller_1 = require("./claims.controller");
const claim_factory_provider_1 = require("./factories/claim-factory.provider");
const common_claim_factory_1 = require("./factories/common-claim.factory");
const electronic_claim_factory_1 = require("./factories/electronic-claim.factory");
const claims_service_proxy_1 = require("./claims.service.proxy");
let ClaimsModule = class ClaimsModule {
};
exports.ClaimsModule = ClaimsModule;
exports.ClaimsModule = ClaimsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            claims_service_1.ClaimsService,
            claims_service_proxy_1.ClaimsServiceProxy,
            claim_factory_provider_1.ClaimFactoryProvider,
            common_claim_factory_1.CommonClaimFactory,
            electronic_claim_factory_1.ElectronicClaimFactory,
        ],
        controllers: [claims_controller_1.ClaimsController],
    })
], ClaimsModule);
//# sourceMappingURL=claims.module.js.map