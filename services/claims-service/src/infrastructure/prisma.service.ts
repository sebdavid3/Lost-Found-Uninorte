import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './prisma/database.config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new Pool({ connectionString: getDatabaseUrl() });
    const adapter = new PrismaPg(pool);
    super({ adapter });
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
