import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [AppController, ObjectsController],
  providers: [ObjectsService, PrismaService],
})
export class AppModule {}
