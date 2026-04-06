import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuditAction } from '../../domain/entities/audit-log-entry.entity';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.auditLogService.getAllLogs(pageNumber, limitNumber);
  }

  @Get('entity/:entityId')
  async getEntityHistory(@Param('entityId') entityId: string) {
    return this.auditLogService.getEntityHistory(entityId);
  }

  @Get('actor/:actorId')
  async getActorHistory(@Param('actorId') actorId: string) {
    return this.auditLogService.getActorHistory(actorId);
  }

  @Get('action/:action')
  async getActionsByType(@Param('action') action: keyof typeof AuditAction) {
    return this.auditLogService.getActionsByType(AuditAction[action]);
  }

  @Get('date-range')
  async getByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.auditLogService.getByDateRange(new Date(start), new Date(end));
  }

  @Get('verify-integrity')
  async verifyIntegrity() {
    return this.auditLogService.verifyIntegrity();
  }
}
