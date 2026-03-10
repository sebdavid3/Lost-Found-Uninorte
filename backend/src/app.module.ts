import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClaimsModule } from './claims/claims.module';
import { PrismaModule } from './prisma/prisma.module';
import { ObjectsModule } from './objects/objects.module';

@Module({
  imports: [ClaimsModule, PrismaModule, ObjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
