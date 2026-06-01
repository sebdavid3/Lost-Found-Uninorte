import {
  Injectable,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OutboxService } from '../application/services/outbox.service';

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private timer: NodeJS.Timeout | null = null;
  private isPublishing = false;

  constructor(
    private readonly outboxService: OutboxService,
    @Inject('AUDIT_SERVICE') private readonly client: ClientProxy,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      void this.publishPendingEvents();
    }, 5000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async publishPendingEvents() {
    if (this.isPublishing) {
      return;
    }

    this.isPublishing = true;

    try {
      const events = await this.outboxService.reserveBatch(20);

      for (const event of events) {
        try {
          const payload = event.payload as unknown as Record<string, unknown>;

          await firstValueFrom(this.client.emit(event.topic, payload));
          await this.outboxService.markPublished(event.id);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown outbox publish error';
          await this.outboxService.markFailed(event.id, event.retryCount, message);
          this.logger.warn(
            `Failed publishing outbox event ${event.id}. Retry ${event.retryCount + 1}.`,
          );
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Outbox publishing cycle failed: ${message}`);
    } finally {
      this.isPublishing = false;
    }
  }
}
