import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ServiceDiscoveryService } from './service-discovery/service-discovery.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // Inyectamos ServiceDiscoveryService para exponer el endpoint /registry
    private readonly discoveryService: ServiceDiscoveryService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ─── HEALTH CHECK ─────────────────────────────────────────────────────────
  // Consul hace GET /health cada 10 segundos para verificar que esta
  // instancia del claims-service está viva. Si responde 2xx → estado "passing"
  // (verde en la UI). Si no responde → estado "critical" → se desregistra.
  //
  // También útil para liveness probes en Kubernetes en el futuro.
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'claims-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  // ─── REGISTRY VIEWER ──────────────────────────────────────────────────────
  // Endpoint para demostrar Service Discovery en la exposición.
  // Muestra en tiempo real qué instancias de un servicio están registradas
  // y saludables en Consul.
  //
  // Ejemplo de uso:
  //   GET /registry/claims-service
  //   → { "service": "claims-service", "totalInstances": 1, "instances": [...] }
  //
  // Si escalas con: docker compose scale claims-service=3
  // → totalInstances será 3, mostrando cada instancia con su ID único.
  @Get('registry/:serviceName')
  async getServiceInstances(@Param('serviceName') serviceName: string) {
    const instances =
      await this.discoveryService.getAllInstances(serviceName);

    return {
      service: serviceName,
      totalInstances: instances.length,
      instances,
      discoveredAt: new Date().toISOString(),
    };
  }
}
