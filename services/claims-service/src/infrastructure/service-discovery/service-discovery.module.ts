import { Module } from '@nestjs/common';
import { ServiceDiscoveryService } from './service-discovery.service';

// Este módulo encapsula todo lo relacionado con Service Discovery.
// Al importarlo en AppModule, NestJS instanciará ServiceDiscoveryService
// y ejecutará automáticamente onModuleInit (registro) y onModuleDestroy
// (desregistro) según el ciclo de vida de la aplicación.
//
// Con "exports" cualquier otro módulo que importe ServiceDiscoveryModule
// puede inyectar ServiceDiscoveryService para usar discoverService().
// Útil cuando el SagaModule (de tu compañero) necesite descubrir
// servicios dinámicamente sin URLs hardcodeadas.
@Module({
  providers: [ServiceDiscoveryService],
  exports: [ServiceDiscoveryService],
})
export class ServiceDiscoveryModule {}
