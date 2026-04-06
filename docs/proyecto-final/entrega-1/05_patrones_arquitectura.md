# 6.5 Patrones de arquitectura

Estado: EN PROGRESO
Responsable: TBD
Fecha de actualizacion: 2026-04-05

## Tabla obligatoria

| Estudiante | Patron | Componente donde se aplica | Problema que resuelve |
| :--- | :--- | :--- | :--- |
| Andres Carrero | Saga | `services/claims-service/src/infrastructure/controllers/claims.controller.ts` (endpoint `POST /claims/:id/verify`) + pipeline de validaciones en `services/claims-service/src/application/handlers/` | Orquestar el flujo de verificacion sin transaccion distribuida (pasos + compensacion de negocio) para evitar estados inconsistentes en un proceso multi-paso |
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

En este corte, Audit Log, Service Discovery y Saga cuentan con evidencia tecnica verificable en el repositorio. Outbox Pattern y Anti-Corruption Layer se mantienen como espacio reservado para completar por sus responsables.

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

Nota de despliegue: Consul se incluye en `docker-compose.yml` para que la demo sea reproducible localmente.

## Evidencia - Saga (flujo de verificacion de reclamacion)

Implementacion actual en `claims-service` (orquestacion + compensacion de negocio):

- Orquestador: endpoint `POST /claims/:id/verify` en `ClaimsController`.
- Pasos (ejecutores): pipeline de validacion tipo *step-by-step* implementado con Chain of Responsibility:
	- `IdentityHandler` (verifica identidad/consistencia del usuario asociado)
	- `AvailabilityHandler` (valida disponibilidad del objeto)
	- `EvidenceMatchHandler` (valida coincidencias de evidencias)
- Resultado exitoso: actualiza la reclamacion a `APPROVED`.
- Compensacion ante fallo: actualiza la reclamacion a `REJECTED` con `rejectionReason` y retorna un `409 CONFLICT` con el eslabon fallido.

Justificacion como Saga:

- No se requiere una transaccion global para coordinar el flujo; se orquesta un proceso multi-paso y se aplican acciones compensatorias cuando un paso falla.
- La implementacion actual es local al microservicio, pero esta estructurada para evolucionar a coordinacion distribuida (por ejemplo, si `Identity` o `Availability` pasan a ser servicios externos descubiertos via Consul).

## Evidencia - Outbox Pattern (placeholder)

Estado: PENDIENTE

Completar:

- Ubicacion en codigo (tabla outbox + publicador).
- Garantias (al menos-once, idempotencia, reintentos).
- Flujo end-to-end (commit BD + publicacion de evento).
- Limitaciones y mitigaciones.

## Evidencia - Anti-Corruption Layer (placeholder)

Estado: PENDIENTE

Completar:

- Integracion externa objetivo (API/servicio).
- Contratos externos vs modelos internos.
- Adaptadores / mapeos DTO -> dominio.
- Politica de errores y versionado.

## Checklist de cierre
- [ ] Todos los patrones con componente concreto (sin TBD).
- [ ] Problema y solucion por patron claramente formulados.
- [ ] Evidencia tecnica verificable por patron (ubicacion exacta + demo).
