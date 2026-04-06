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
var ServiceDiscoveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const Consul = require('consul');
let ServiceDiscoveryService = ServiceDiscoveryService_1 = class ServiceDiscoveryService {
    logger = new common_1.Logger(ServiceDiscoveryService_1.name);
    consul;
    serviceId;
    serviceName = 'claims-service';
    constructor() {
        this.consul = new Consul({
            host: process.env.CONSUL_HOST ?? 'consul',
            port: Number(process.env.CONSUL_PORT) || 8500,
            promisify: true,
        });
        this.serviceId = `${this.serviceName}-${process.env.HOSTNAME ?? 'local'}`;
    }
    async onModuleInit() {
        await this.registerService();
    }
    async onModuleDestroy() {
        await this.deregisterService();
    }
    async registerService() {
        const address = process.env.SERVICE_HOST ?? 'claims-service';
        const port = parseInt(process.env.SERVICE_PORT ?? '3000');
        try {
            await this.consul.agent.service.register({
                id: this.serviceId,
                name: this.serviceName,
                address,
                port,
                tags: ['lost-found', 'claims', 'nestjs', 'v1'],
                check: {
                    http: `http://${address}:${port}/health`,
                    interval: '10s',
                    timeout: '5s',
                    deregistercriticalserviceafter: '30s',
                },
            });
            this.logger.log(`✅ Registrado en Consul con ID: "${this.serviceId}" → ${address}:${port}`);
        }
        catch (error) {
            this.logger.error('❌ Error al registrar en Consul:', error);
        }
    }
    async deregisterService() {
        try {
            await this.consul.agent.service.deregister(this.serviceId);
            this.logger.log(`🔴 Desregistrado de Consul: "${this.serviceId}"`);
        }
        catch (error) {
            this.logger.error('❌ Error al desregistrar de Consul:', error);
        }
    }
    async discoverService(serviceName) {
        const services = await this.consul.health.service({
            service: serviceName,
            passing: true,
        });
        if (!services || services.length === 0) {
            throw new Error(`No se encontraron instancias saludables del servicio: "${serviceName}"`);
        }
        const instance = services[Math.floor(Math.random() * services.length)];
        return {
            address: instance.Service.Address,
            port: instance.Service.Port,
        };
    }
    async getAllInstances(serviceName) {
        const services = await this.consul.health.service({
            service: serviceName,
            passing: true,
        });
        return services.map((s) => ({
            id: s.Service.ID,
            address: s.Service.Address,
            port: s.Service.Port,
            tags: s.Service.Tags ?? [],
            status: 'healthy',
        }));
    }
};
exports.ServiceDiscoveryService = ServiceDiscoveryService;
exports.ServiceDiscoveryService = ServiceDiscoveryService = ServiceDiscoveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ServiceDiscoveryService);
//# sourceMappingURL=service-discovery.service.js.map