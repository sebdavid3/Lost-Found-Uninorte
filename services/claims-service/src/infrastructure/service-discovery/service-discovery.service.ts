import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
const Consul = require('consul');

@Injectable()
export class ServiceDiscoveryService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ServiceDiscoveryService.name);
  private consul: any;
  private readonly serviceId: string;
  private readonly serviceName = 'claims-service';
  private readonly consulHost: string;
  private readonly consulPort: number;
  private readonly serviceAddress: string;
  private readonly servicePort: number;

  constructor() {
    this.consulHost = process.env.CONSUL_HOST || '';
    this.consulPort = Number(process.env.CONSUL_PORT || '');
    this.serviceAddress = process.env.SERVICE_HOST || '';
    this.servicePort = Number(process.env.SERVICE_PORT || '');

    if (!this.consulHost || Number.isNaN(this.consulPort)) {
      throw new Error('CONSUL_HOST y CONSUL_PORT son obligatorios para Service Discovery.');
    }

    if (!this.serviceAddress || Number.isNaN(this.servicePort)) {
      throw new Error('SERVICE_HOST y SERVICE_PORT son obligatorios para registrar el servicio.');
    }

    // Lee las variables de entorno definidas en docker-compose.yml
    this.consul = new Consul({
      host: this.consulHost,
      port: this.consulPort,
      promisify: true,
    });

    // ID único por instancia. Cuando se escala horizontalmente
    // (ej: docker compose scale claims-service=3), cada contenedor
    // tiene un HOSTNAME distinto, así cada instancia queda registrada
    // con un ID único en lugar de sobreescribirse.
    this.serviceId = `${this.serviceName}-${process.env.HOSTNAME ?? 'local'}`;
  }

  // NestJS llama a este método automáticamente cuando el módulo arranca.
  // Es el equivalente al onModuleInit del PrismaService en este proyecto.
  async onModuleInit(): Promise<void> {
    await this.registerService();
  }

  // NestJS llama a este método automáticamente cuando la app recibe
  // SIGTERM o SIGINT (Ctrl+C, docker compose stop, restart, etc.)
  async onModuleDestroy(): Promise<void> {
    await this.deregisterService();
  }

  // Registra esta instancia del servicio en el Consul registry.
  // Consul almacena: nombre, dirección, puerto, tags y configuración
  // del health check para saber si la instancia está viva.
  private async registerService(): Promise<void> {
    const address = this.serviceAddress;
    const port = this.servicePort;

    try {
      await this.consul.agent.service.register({
        id: this.serviceId,
        name: this.serviceName,
        address,
        port,
        tags: ['lost-found', 'claims', 'nestjs', 'v1'],
        check: {
          // Consul hace GET a esta URL cada 10 segundos para verificar
          // que esta instancia del servicio está activa y respondiendo.
          // Si falla 3 veces consecutivas → marca como "critical".
          // Si sigue critical 30 segundos → se desregistra automáticamente.
          http: `http://${address}:${port}/health`,
          interval: '10s',
          timeout: '5s',
          deregistercriticalserviceafter: '30s',
        },
      });

      this.logger.log(
        `✅ Registrado en Consul con ID: "${this.serviceId}" → ${address}:${port}`,
      );
    } catch (error) {
      // No tiramos excepción para no bloquear el arranque de la app
      // si Consul no está disponible en ese momento.
      this.logger.error('❌ Error al registrar en Consul:', error);
    }
  }

  // Desregistra esta instancia del registry cuando la app se apaga.
  // Esto es importante para que el registry no tenga entradas "fantasma"
  // de servicios que ya no existen.
  private async deregisterService(): Promise<void> {
    try {
      await this.consul.agent.service.deregister(this.serviceId);
      this.logger.log(`🔴 Desregistrado de Consul: "${this.serviceId}"`);
    } catch (error) {
      this.logger.error('❌ Error al desregistrar de Consul:', error);
    }
  }

  // Descubre dinámicamente la dirección de un servicio registrado en Consul.
  // Solo retorna instancias con health check en estado "passing" (verde).
  // Si hay múltiples instancias, aplica balanceo de carga aleatorio.
  //
  // Uso futuro: cuando el saga-service (patrón Saga de tu compañero)
  // necesite comunicarse con el claims-service, en lugar de tener
  // "http://claims-service:3000" hardcodeado, llamará a este método.
  async discoverService(
    serviceName: string,
  ): Promise<{ address: string; port: number }> {
    const services = await this.consul.health.service({
      service: serviceName,
      passing: true, // solo instancias con health check verde
    });

    if (!services || services.length === 0) {
      throw new Error(
        `No se encontraron instancias saludables del servicio: "${serviceName}"`,
      );
    }

    // Round-robin simple: selección aleatoria entre instancias disponibles
    const instance = services[Math.floor(Math.random() * services.length)];

    return {
      address: instance.Service.Address,
      port: instance.Service.Port,
    };
  }

  // Retorna TODAS las instancias saludables registradas de un servicio.
  // Usado por el endpoint GET /registry/:serviceName del AppController
  // para demostrar el funcionamiento durante la exposición.
  async getAllInstances(serviceName: string): Promise<
    Array<{
      id: string;
      address: string;
      port: number;
      tags: string[];
      status: string;
    }>
  > {
    const services = await this.consul.health.service({
      service: serviceName,
      passing: true,
    });

    return services.map((s: any) => ({
      id: s.Service.ID,
      address: s.Service.Address,
      port: s.Service.Port,
      tags: s.Service.Tags ?? [],
      status: 'healthy',
    }));
  }
}
