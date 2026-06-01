import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ServiceDiscoveryService } from './service-discovery/service-discovery.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly discoveryService: ServiceDiscoveryService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'claim-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  @Get('registry/:serviceName')
  async getServiceInstances(@Param('serviceName') serviceName: string) {
    const instances = await this.discoveryService.getAllInstances(serviceName);
    return {
      service: serviceName,
      totalInstances: instances.length,
      instances,
      discoveredAt: new Date().toISOString(),
    };
  }

  @Get('stats/dashboard')
  async getDashboardStats() {
    return this.appService.getDashboardStats();
  }
}
