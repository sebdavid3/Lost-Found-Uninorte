import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'user-service ok';
  }

  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', service: 'user-service', timestamp: new Date().toISOString() };
    } catch (e) {
      return { status: 'degraded', service: 'user-service', timestamp: new Date().toISOString() };
    }
  }
}
