import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './infrastructure/persistence/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'audit-service',
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      return {
        status: 'degraded',
        service: 'audit-service',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
