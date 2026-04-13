import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClaimsModule } from './claims.module';
import { PrismaModule } from './prisma.module';
import { ObjectsModule } from './objects.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from '../application/interceptors/audit-log.interceptor';
import { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';
import { OutboxPublisherService } from './outbox-publisher.service';

const rabbitMqUrl = process.env.RABBITMQ_URL;

if (!rabbitMqUrl || rabbitMqUrl.trim() === '') {
  throw new Error('RABBITMQ_URL no esta configurada para claims-service.');
}

@Module({
  imports: [
    ClaimsModule,
    PrismaModule,
    ObjectsModule,
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rabbitMqUrl],
          queue: 'audit_events_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ServiceDiscoveryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    OutboxPublisherService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
