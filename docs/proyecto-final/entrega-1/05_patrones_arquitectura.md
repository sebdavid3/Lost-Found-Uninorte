# 6.5 Patrones de arquitectura

Estado: LISTO PARA REVISION
Responsable: Equipo Lost & Found
Fecha de actualizacion: 2026-05-28

## Tabla obligatoria

| Estudiante | Patron | Componente donde se aplica | Problema que resuelve |
| :--- | :--- | :--- | :--- |
| Andres Carrero | Saga | `services/claims-service/src/infrastructure/controllers/claims.controller.ts` (endpoint `POST /claims/:id/verify`) + pipeline de validaciones en `services/claims-service/src/application/handlers/` | Orquestar el flujo de verificacion sin transaccion distribuida (pasos + compensacion de negocio) para evitar estados inconsistentes en un proceso multi-paso |
| Sebastian Ibanez | Audit Log | `services/audit-service/` y `services/claims-service/src/application/interceptors/audit-log.interceptor.ts` | Trazabilidad inmutable de acciones, no repudio y verificacion de integridad por hash chain |
| Ayen Henriquez | Service Discovery | `services/claims-service/src/infrastructure/service-discovery/` + endpoints `GET /health` y `GET /registry/:serviceName` | Resolver endpoints dinamicamente y reducir acoplamiento por configuraciones estaticas |
| Luis Robles | Outbox Pattern | `services/claims-service/src/application/services/outbox.service.ts`, `services/claims-service/src/infrastructure/outbox-publisher.service.ts` y tabla `OutboxEvent` en Prisma | Garantizar consistencia eventual ("at-least-once" delivery) entre el commit de la base de datos de claims y la publicación de eventos de auditoría en RabbitMQ, previniendo pérdidas de mensajes por caídas del broker o de la aplicación. |
| Andres Serrano | Anti-Corruption Layer | `services/claims-service/src/infrastructure/acl/anti-corruption-layer.service.ts` | Traducir contratos externos al lenguaje del dominio interno y aislar los modelos del dominio de reclamaciones de cambios en la API externa o payloads del cliente, controlando a su vez la exposición segura de datos según rol (`ClaimResponseDto`). |

## Evidencia minima por patron

- Ubicacion exacta en codigo.
- Flujo que atraviesa el sistema.
- Beneficio tecnico y limitaciones.
- Caso concreto donde evita un problema real.

## Nota de avance

En esta entrega, todos los patrones arquitectónicos (Saga, Audit Log, Service Discovery, Outbox Pattern y Anti-Corruption Layer) cuentan con implementaciones reales y robustas en el código, con evidencia técnica verificable en el repositorio y cobertura de pruebas correspondientes.

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

## Evidencia - Outbox Pattern (Luis Robles)

Implementación real en `claims-service`:

*   **Ubicación en código:** 
    *   Modelo de base de datos en `services/claims-service/prisma/schema.prisma` (modelo `OutboxEvent`).
    *   Servicio transaccional de encolado: `services/claims-service/src/application/services/outbox.service.ts`.
    *   Publicador periódico asíncrono: `services/claims-service/src/infrastructure/outbox-publisher.service.ts`.
*   **Garantías de Entrega:**
    *   **Consistencia eventual ("At-least-once"):** El evento se persiste dentro de la misma transacción relacional de base de datos del negocio (ej. al guardar una reclamación) mediante `enqueueAuditEvent(tx, eventData)`. Esto asegura que si la base de datos hace commit de la reclamación, el evento se guardará obligatoriamente.
    *   **Procesamiento y reintentos robustos:** El publicador lee periódicamente lotes en estado `PENDING` o `FAILED` usando un mecanismo de bloqueo atómico (`PROCESSING`) y despacha las cargas a RabbitMQ. Si la publicación falla, se marca como `FAILED`, se incrementa el contador de reintentos y se agenda el siguiente intento con retraso exponencial (*exponential backoff*): `delayMs = Math.min(30000, 1000 * 2^retryCount)`.
    *   **Recuperación ante caídas:** El scheduler incluye en el lote aquellos eventos que queden atascados en estado `PROCESSING` si ha transcurrido un tiempo prudente (evitando huérfanos).
*   **Flujo end-to-end:**
    1. El usuario realiza una acción en `claims-service` (ej: crear o actualizar claim).
    2. El caso de uso (`claims.service.ts`) inicia una transacción Prisma.
    3. Se ejecuta la lógica del dominio de claims y se invoca `outboxService.enqueueAuditEvent(tx, payload)` dentro de la misma transacción.
    4. Si la transacción es exitosa, se confirma la base de datos (reclamación + evento persistido).
    5. Fuera del hilo principal, el `OutboxPublisherService` (ejecutándose en un intervalo de 5 segundos) reserva el lote de eventos pendientes, los publica a RabbitMQ en el tópico `audit.event.created` y los marca como `PUBLISHED`.
*   **Caso de uso real:** Si RabbitMQ o el microservicio `audit-service` se caen en el momento en que un estudiante radica un reclamo, la transacción de reclamación no falla (alta disponibilidad del flujo de negocio) y los eventos se quedan almacenados localmente de forma segura en `OutboxEvent`. Tan pronto como RabbitMQ vuelve a estar activo, el publicador procesa la cola local y los entrega de manera garantizada y consistente.

## Evidencia - Anti-Corruption Layer (Andrés Serrano)

Implementación real en `claims-service`:

*   **Ubicación en código:**
    *   Clase adaptadora principal: `services/claims-service/src/infrastructure/acl/anti-corruption-layer.service.ts`.
    *   Conjunto de pruebas: `services/claims-service/src/infrastructure/acl/anti-corruption-layer.service.spec.ts`.
*   **Diseño y Traducción de Contratos:**
    *   **Normalización de Entrada:** Traduce los datos provenientes de la capa de API (como el payload HTTP decodificado en `CreateClaimDto`) antes de que entren al dominio. Limpia los espacios en blanco (`trim`), normaliza el formato de las categorías (`normalizeObjectCategory`) y normaliza a mayúsculas los tipos de evidencias (`SERIAL_NUMBER`, `DETAILED_DESCRIPTION`, etc.), lanzando excepciones tempranas del protocolo HTTP ante valores fuera del dominio.
    *   **Mapeo de Modelos de Dominio a Salida:** El método `toClaimResponse(claim, role)` recibe la entidad de base de datos (`Claim` con relaciones de Prisma) y la mapea a un contrato de salida estricto `ClaimResponseDto`.
    *   **Control de Seguridad y Privacidad por Rol:** Durante la traducción de salida, el ACL restringe o enriquece los datos basándose en el rol del usuario autenticado:
        *   Si el usuario tiene rol `Role.ADMIN`, el DTO resultante contendrá el campo `rejectionReason` (útil para auditoría de rechazo).
        *   Si el usuario es `Role.STUDENT`, el ACL sanitiza la salida omitiendo detalles sensibles que no le pertenecen.
*   **Caso de uso real:** Si en el futuro el modelo relacional de la base de datos cambia (por ejemplo, si el modelo `Object` pasa a llamarse `FoundItem` o si la tabla `Evidence` separa sus campos de manera distinta), la lógica del negocio de reclamaciones y el API expuesto al frontend no se ven afectados directamente. Solo se requiere actualizar los adaptadores de mapeo del `AntiCorruptionLayerService` para reflejar el cambio, conteniendo la "corrupción" y previniendo que las modificaciones de infraestructura rompan el contrato exterior de la API o el Core del dominio.

## Checklist de cierre

- [x] Todos los patrones con componente concreto (sin TBD).
- [x] Problema y solucion por patron claramente formulados.
- [x] Evidencia tecnica verificable por patron (ubicacion exacta + demo).