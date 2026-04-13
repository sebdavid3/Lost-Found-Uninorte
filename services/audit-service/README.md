# Audit Service - Lost & Found Uninorte

Microservicio dedicado a trazabilidad y auditoria inmutable del ecosistema Lost & Found Uninorte.

## Responsabilidad

- Consumir eventos de auditoria desde RabbitMQ.
- Persistir registros de auditoria en una base de datos aislada.
- Mantener una cadena criptografica de integridad con `previousHash` y `hash`.
- Exponer endpoints de consulta y verificacion de integridad.

## Arquitectura Interna (Clean Architecture)

- Domain:
  - Entidad y enums: `src/domain/entities/audit-log-entry.entity.ts`
  - Puerto de repositorio: `src/domain/ports/audit-log.repository.ts`
  - Factory de hash: `src/domain/factories/audit-log.factory.ts`
- Application:
  - Caso de uso: `src/application/services/audit-log.service.ts`
- Infrastructure:
  - Adaptador Prisma: `src/infrastructure/persistence/prisma-audit-log.repository.ts`
  - Consumidor RMQ: `src/infrastructure/messaging/audit-event.consumer.ts`
  - Controlador REST: `src/infrastructure/controllers/audit-log.controller.ts`

## Flujo de Evento Auditado

1. `claims-service` emite evento `audit.event.created`.
2. `audit-service` consume el evento en `AuditEventConsumer`.
3. El repositorio bloquea transaccionalmente la ultima fila (`FOR UPDATE`) para preservar secuencia de hash.
4. Se crea el registro con `previousHash` y `hash` calculado por factory.

## Endpoints

- `GET /audit-log`
- `GET /audit-log/entity/:entityId`
- `GET /audit-log/actor/:actorId`
- `GET /audit-log/action/:action`
- `GET /audit-log/date-range?start=...&end=...`
- `GET /audit-log/verify-integrity`

Respuesta esperada de integridad:

`{"isValid": true, "brokenAt": null}`

## Persistencia y Migraciones

- Esquema Prisma: `prisma/schema.prisma`
- Migracion inicial versionada: `prisma/migrations/20260405080000_init/migration.sql`
- El entorno Docker ejecuta `npx prisma migrate deploy` antes de iniciar el servicio.

## Ejecucion Local

Desde la raiz del repositorio:

`docker compose up --build -d`

Solo este servicio (si usas ejecucion manual):

1. `cp .env.example .env`
2. `npm install`
3. `npx prisma migrate deploy`
4. `npm run start:prod`
