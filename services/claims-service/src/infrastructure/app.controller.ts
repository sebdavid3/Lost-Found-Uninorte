import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { ServiceDiscoveryService } from './service-discovery/service-discovery.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly discoveryService: ServiceDiscoveryService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('users/me')
  async getUserByEmail(@Query('email') email: string) {
    if (!email) throw new BadRequestException('Email requerido');

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'ADMIN' : 'STUDENT',
        },
      });
    }

    return { id: user.id, email: user.email, name: user.name, role: user.role };
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

  // ─── DASHBOARD STATS ──────────────────────────────────────────────────────
  @Get('stats/dashboard')
  async getDashboardStats() {
    return this.appService.getDashboardStats();
  }
}
