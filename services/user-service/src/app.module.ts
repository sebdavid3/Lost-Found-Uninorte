import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [AppController, UsersController],
  providers: [UsersService, PrismaService],
})
export class AppModule {}
