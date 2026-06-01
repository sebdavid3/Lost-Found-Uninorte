import { Module } from '@nestjs/common';
import { ObjectsService } from './objects/objects.service';
import { ObjectsController } from './objects/objects.controller';
import { OutboxService } from '../application/services/outbox.service';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ObjectsService, OutboxService],
  controllers: [ObjectsController],
})
export class ObjectsModule {}
