import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClaimsModule } from './claims.module';
import { PrismaModule } from './prisma.module';
import { ObjectsModule } from './objects.module';
import { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';

@Module({
  imports: [
    ClaimsModule,
    PrismaModule,
    ObjectsModule,
    // Al agregar ServiceDiscoveryModule aquí, NestJS lo instancia junto
    // con el resto de la app. El ServiceDiscoveryService implementa
    // OnModuleInit → se registra en Consul automáticamente al arrancar.
    ServiceDiscoveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
