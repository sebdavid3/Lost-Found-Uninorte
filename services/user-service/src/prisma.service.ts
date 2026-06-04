import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conectado a PostgreSQL (user-service).');
    } catch (error) {
      this.logger.error('Error conectando a BD:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
