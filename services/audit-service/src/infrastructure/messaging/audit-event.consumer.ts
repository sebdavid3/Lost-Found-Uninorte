import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuditEventDto } from '../../domain/factories/audit-log.factory';

@Controller()
export class AuditEventConsumer {
  constructor(private readonly auditLogService: AuditLogService) {}

  @EventPattern('audit.event.created')
  async handleAuditEvent(@Payload() eventData: AuditEventDto) {
    try {
      await this.auditLogService.processAuditEvent(eventData);
      console.log(`[Audit Service] Successfully processed audit event: ${eventData.action} by ${eventData.actorId}`);
    } catch (error) {
      console.error(`[Audit Service] Failed to process audit event:`, error);
      throw error;
    }
  }
}
