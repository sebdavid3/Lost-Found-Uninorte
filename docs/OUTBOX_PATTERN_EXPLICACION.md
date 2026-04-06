# Outbox Pattern - Explicacion para Exposicion

## Problema que resuelve
Sin Outbox, el servicio podia:
1. Guardar la reclamacion en base de datos.
2. Fallar al publicar el evento en RabbitMQ.

Ese escenario rompe consistencia: la data existe, pero otros servicios nunca se enteran.

## Solucion aplicada
Ahora cada cambio importante (crear, actualizar, eliminar, verificar reclamacion) hace dos cosas en la misma transaccion:
1. Persiste el cambio de negocio en tablas funcionales (Claim, Evidence).
2. Inserta un registro en la tabla `OutboxEvent` con estado `PENDING`.

Si la transaccion falla, no se guarda ni el cambio ni el evento.
Si la transaccion confirma, ambos quedan consistentes.

## Componentes implementados

### 1) Modelo Outbox en Prisma
Archivo: `services/claims-service/prisma/schema.prisma`

Se agrego:
- Enum `OutboxStatus`: `PENDING`, `PROCESSING`, `PUBLISHED`, `FAILED`
- Modelo `OutboxEvent`:
  - `topic`: nombre del evento de mensajeria (`audit.event.created`)
  - `payload`: JSON del evento
  - `status`, `retryCount`, `nextAttemptAt`, `lastError`
  - `publishedAt`, `createdAt`, `updatedAt`
- Indice por `status` y `nextAttemptAt` para polling eficiente.

### 2) Migracion SQL
Archivo: `services/claims-service/prisma/migrations/20260405223000_add_outbox_events/migration.sql`

Crea enum, tabla e indice en PostgreSQL para soportar el patron.

### 3) Servicio de Outbox
Archivo: `services/claims-service/src/application/services/outbox.service.ts`

Responsabilidades:
- `enqueueAuditEvent(...)`: guarda evento en outbox dentro de una transaccion Prisma.
- `reserveBatch(...)`: toma lote publicable y lo marca como `PROCESSING`.
- `markPublished(...)`: marca evento como publicado.
- `markFailed(...)`: aplica retry con backoff exponencial y registra error.

### 4) Publicador en background
Archivo: `services/claims-service/src/infrastructure/outbox-publisher.service.ts`

Cada 5 segundos:
1. Reserva eventos pendientes/fallidos listos para reintentar.
2. Publica en RabbitMQ usando `ClientProxy.emit(...)`.
3. Si publica, estado `PUBLISHED`.
4. Si falla, estado `FAILED`, incrementa reintentos y agenda `nextAttemptAt`.

### 5) Escrituras de Claim con transaccion + outbox
Archivo: `services/claims-service/src/application/services/claims.service.ts`

Se ajustaron metodos:
- `create`
- `update`
- `remove`

Cada uno ahora usa `prisma.$transaction(...)` y encola evento outbox en la misma transaccion.

### 6) Verificacion administrativa tambien consistente
Archivo: `services/claims-service/src/infrastructure/controllers/claims.controller.ts`

En `POST /claims/:id/verify`:
- Rama de aprobacion: actualiza estado a `APPROVED` + encola evento `CLAIM_VERIFIED` con `SUCCESS`.
- Rama de rechazo: actualiza a `REJECTED` + encola evento `CLAIM_VERIFIED` con `FAILURE` y detalle.

Ambas ramas quedan transaccionales.

### 7) Activacion en modulo
Archivo: `services/claims-service/src/infrastructure/app.module.ts`

Se registra `OutboxPublisherService` como provider para ejecutar el ciclo de publicacion.

## Flujo final (resumen)
1. Llega request de escritura.
2. Se ejecuta transaccion DB.
3. Se guarda cambio de negocio + evento `OutboxEvent(PENDING)`.
4. Worker interno toma evento y publica en RabbitMQ.
5. Evento queda `PUBLISHED` o `FAILED` con reintento.

## Beneficios tecnicos
- Consistencia transaccional entre estado de negocio y evento.
- Tolerancia a fallos temporales de RabbitMQ.
- Reintentos automáticos sin perder eventos.
- Trazabilidad de entrega via tabla outbox.

## Mensaje corto para tu explicacion oral
"Implementamos Outbox para garantizar atomicidad logica entre persistencia y mensajeria: cuando una reclamacion cambia, el evento se guarda en la misma transaccion en `OutboxEvent`. Luego un publicador asíncrono lo entrega a RabbitMQ con reintentos. Asi evitamos inconsistencias del tipo 'dato confirmado pero evento perdido'."
