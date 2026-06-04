import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'], credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] });

  const config = new DocumentBuilder()
    .setTitle('Object Service')
    .setDescription('API de gestión de objetos perdidos')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-user-role', in: 'header' }, 'role')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
