import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const rabbitMqUrl = process.env.RABBITMQ_URL;
  const port = Number(process.env.PORT || process.env.SERVICE_PORT || '3001');

  if (!rabbitMqUrl || rabbitMqUrl.trim() === '') {
    throw new Error('RABBITMQ_URL no esta configurada para audit-service.');
  }

  // Configure RabbitMQ consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: 'audit_events_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  // Listen HTTP for REST endpoints
  await app.listen(port);
  console.log(
    `Audit Service is running on port ${port} and listening to RMQ: audit_events_queue`,
  );
}
void bootstrap();
