import { Module } from '@nestjs/common';
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditEventConsumer } from './messaging/audit-event.consumer';
import { PrismaService } from './persistence/prisma.service';
import { PrismaAuditLogRepository } from './persistence/prisma-audit-log.repository';
import { AuditLogService } from '../application/services/audit-log.service';
import { AuditLogFactory } from '../domain/factories/audit-log.factory';
import { AUDIT_LOG_REPOSITORY } from '../domain/ports/audit-log.repository';

@Module({
  controllers: [
    AuditLogController,
    AuditEventConsumer
  ],
  providers: [
    PrismaService,
    AuditLogFactory,
    AuditLogService,
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: PrismaAuditLogRepository,
    },
  ],
})
export class AuditModule {}
