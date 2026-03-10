import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClaimsModule } from './claims/claims.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ClaimsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
