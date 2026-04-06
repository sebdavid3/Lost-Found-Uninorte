import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClaimsModule } from './claims.module';
import { PrismaModule } from './prisma.module';
import { ObjectsModule } from './objects.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';
import { OutboxPublisherService } from './outbox-publisher.service';

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
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
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
  ],
})
export class AppModule {}
