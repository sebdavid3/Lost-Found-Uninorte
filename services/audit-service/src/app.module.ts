import { Module } from '@nestjs/common';
import { AuditModule } from './infrastructure/audit.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuditModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
