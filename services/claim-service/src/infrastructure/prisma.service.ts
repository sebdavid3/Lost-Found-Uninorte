import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conectado a la base de datos PostgreSQL exitosamente.');
    } catch (error) {
      this.logger.error('Error conectando a la base de datos:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
