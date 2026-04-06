# 6.5 Patrones de arquitectura

Estado: EN PROGRESO
Responsable: TBD
Fecha de actualizacion: 2026-04-05

## Tabla obligatoria

| Estudiante | Patron | Componente donde se aplica | Problema que resuelve |
| :--- | :--- | :--- | :--- |
| Andres Carrero | Saga | Orquestador de flujo de reclamacion (componente de aplicacion/microservicio de coordinacion) | Coordinar pasos distribuidos, definir compensaciones y evitar estados inconsistentes en procesos multi-paso |
| Sebastian Ibanez | Audit Log | `services/audit-service/` y `services/claims-service/src/application/interceptors/audit-log.interceptor.ts` | Trazabilidad inmutable de acciones, no repudio y verificacion de integridad por hash chain |
| Ayen Henriquez | Service Discovery | `services/claims-service/src/infrastructure/service-discovery/` + endpoints `GET /health` y `GET /registry/:serviceName` | Resolver endpoints dinamicamente y reducir acoplamiento por configuraciones estaticas |
| Luis Robles | Outbox Pattern | Componente Outbox vinculado al dominio transaccional de reclamaciones (objetivo de arquitectura) | Garantizar consistencia entre commit de base de datos y publicacion de eventos |
| Andres Serrano | Anti-Corruption Layer | Capa ACL en integraciones externas (adaptadores/anti-corruption en borde de infraestructura) | Traducir contratos externos al lenguaje del dominio interno y aislar cambios de terceros |

## Evidencia minima por patron

- Ubicacion exacta en codigo.
- Flujo que atraviesa el sistema.
- Beneficio tecnico y limitaciones.
- Caso concreto donde evita un problema real.

## Nota de avance

En este corte, Audit Log cuenta con evidencia tecnica implementada y desplegada. Service Discovery ya cuenta con evidencia tecnica en `claims-service` (registro en Consul + endpoints de demostracion). Los demas patrones aparecen definidos a nivel de arquitectura objetivo y deben completarse con evidencia de implementacion en sus respectivas secciones tecnicas.

## Evidencia - Service Discovery (Consul)

Implementacion actual en `claims-service`:

- Registro automatico al iniciar el servicio (ciclo de vida NestJS): `ServiceDiscoveryService` ejecuta `onModuleInit()` y registra la instancia en Consul.
- Desregistro automatico al apagar el servicio: `onModuleDestroy()` elimina la instancia para evitar entradas fantasma.
- Health check para Consul: endpoint `GET /health` en `AppController` (responde 2xx con metadata de uptime).
- Descubrimiento dinamico:
	- `discoverService(serviceName)` consulta en Consul solo instancias en estado passing y selecciona una instancia saludable.
	- `getAllInstances(serviceName)` retorna todas las instancias saludables; usado para demostracion.
- Endpoint de demostracion en tiempo real: `GET /registry/:serviceName` devuelve instancias registradas y saludables.

Variables de entorno usadas (con defaults para docker):

- `CONSUL_HOST` (default: `consul`)
- `CONSUL_PORT` (default: `8500`)
- `SERVICE_HOST` (default: `claims-service`)
- `SERVICE_PORT` (default: `3000`)

Pendiente tecnico (para consistencia de despliegue): agregar el contenedor `consul` a `docker-compose.yml` o documentar el uso de un Consul externo si se quiere ejecutar la demo de Service Discovery end-to-end.

## Checklist de cierre
- [ ] Todos los patrones con componente concreto (sin TBD).
- [ ] Todos los patrones con problema resuelto claramente formulado.
- [ ] Evidencia tecnica verificable por patron.
