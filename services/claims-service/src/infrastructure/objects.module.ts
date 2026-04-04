import { Module } from '@nestjs/common';
import { ObjectsService } from './objects/objects.service';
import { ObjectsController } from './objects/objects.controller';

@Module({
  providers: [ObjectsService],
  controllers: [ObjectsController],
})
export class ObjectsModule {}
