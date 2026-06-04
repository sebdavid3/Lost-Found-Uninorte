import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClaimsModule } from './claims.module';
import { PrismaModule } from './prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from '../application/interceptors/audit-log.interceptor';
import { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';
import { OutboxPublisherService } from './outbox-publisher.service';
import { UserClientService } from './clients/user-client.service';
import { ObjectClientService } from './clients/object-client.service';

const rabbitMqUrl = process.env.RABBITMQ_URL;

if (!rabbitMqUrl || rabbitMqUrl.trim() === '') {
  throw new Error('RABBITMQ_URL no esta configurada para claim-service.');
}

@Module({
  imports: [
    HttpModule,
    ClaimsModule,
    PrismaModule,
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
    UserClientService,
    ObjectClientService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
