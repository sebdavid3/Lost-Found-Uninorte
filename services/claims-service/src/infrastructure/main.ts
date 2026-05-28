import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ForbiddenExceptionFilter } from './common/filters/forbidden-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors(); // <--- AGREGAR ESTO PARA PERMITIR AL FRONTEND ACCEDER
  app.useGlobalFilters(new ForbiddenExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
