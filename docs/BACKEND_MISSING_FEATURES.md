# Backend — Funcionalidades Faltantes

> **Proyecto:** Lost & Found Uninorte
> **Branch:** `entrega-final`
> **Propósito:** Funcionalidades que **no existen** y hay que implementar desde cero. No incluye código roto (eso va en `BACKEND_FIXES.md`).

---

## NF1. Objects CRUD completo

**Estado:** Solo existen `GET /objects` y `GET /objects/:id` (solo lectura).

**Endpoints a implementar:**

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST`   | `/objects`                            | Registrar objeto perdido/encontrado | ADMIN |
| `PATCH`  | `/objects/:id`                        | Actualizar detalles del objeto      | ADMIN |
| `DELETE` | `/objects/:id`                        | Eliminar objeto del catálogo        | ADMIN |
| `GET`    | `/objects?category=&location=&q=`     | Búsqueda con filtros                | Público |

**Archivos a crear:**
- `services/claims-service/src/application/dto/create-object.dto.ts`
- `services/claims-service/src/application/dto/update-object.dto.ts`
- `services/claims-service/src/application/dto/object-search-params.dto.ts`

**Archivos a modificar:**
- `services/claims-service/src/infrastructure/objects/objects.controller.ts`
- `services/claims-service/src/infrastructure/objects/objects.service.ts`
- `services/claims-service/src/infrastructure/app.module.ts` (si es necesario registrar nuevos providers)

---

## NF2. Paginación en endpoints de lista

**Estado:** `GET /claims` y `GET /objects` cargan todos los registros sin paginar. `GET /audit-log` **ya tiene paginación** implementada con `page`/`limit`.

**Implementar en:**
- `claims.controller.ts` — `findAll()` con query params `page` y `limit`
- `objects.controller.ts` — `findAll()` con `page` y `limit`
- `audit-log.controller.ts` — ✅ **ya implementado**, verificar que funcione correctamente

```ts
@Get()
async findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
) {
  const skip = (page - 1) * limit;
  return this.prisma.claim.findMany({ skip, take: limit, ... });
}
```

---

## NF3. Endpoint `GET /claims/my` para estudiantes

**Estado:** Los estudiantes no tienen forma de ver el estado de sus reclamos. El proxy actual filtra en memoria (ineficiente).

**Endpoint nuevo:**
```
GET /claims/my?page=1&limit=20
Headers: x-user-id, x-user-role
```

**Archivos a modificar:**
- `services/claims-service/src/infrastructure/controllers/claims.controller.ts`
- `services/claims-service/src/application/services/claims.service.ts` — agregar método `findByUser()`

---

## NF4. Documentación Swagger / OpenAPI

**Estado:** Cero documentación de API. No hay decoradores Swagger ni UI.

**Dependencia:**
```bash
npm install @nestjs/swagger
```

**Archivo a modificar:** `services/claims-service/src/infrastructure/main.ts`

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Lost & Found Uninorte — Claims Service')
  .setDescription('API de gestión de reclamos')
  .setVersion('1.0')
  .addApiKey({ type: 'apiKey', name: 'x-user-role', in: 'header' }, 'role')
  .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'userId')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Decorar controladores** con `@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc.

Mismo patrón para `audit-service`.

---

## NF5. Health endpoint en audit-service

**Estado:** `claims-service` tiene `/health`, `audit-service` no.

**Archivo a modificar:** `services/audit-service/src/app.controller.ts`

```ts
@Get('health')
async health() {
  const dbOk = await this.prismaService.$queryRaw`SELECT 1`.catch(() => false);
  return {
    status: dbOk ? 'ok' : 'degraded',
    service: 'audit-service',
    timestamp: new Date().toISOString(),
  };
}
```

**Archivo a modificar:** `docker-compose.yml` — actualizar health check del audit-service para apuntar a `/health`

---

## NF6. Tests unitarios e integración

**Estado:** Solo 1 archivo con tests reales (ACL). El resto son stubs de `shouldBeDefined()`.

**Prioridad de implementación:**

| Archivo | Por qué |
|---------|---------|
| `handlers/*.ts` (4 archivos) | Core del negocio — Chain of Responsibility |
| `factories/*.ts` (4 archivos) | Validación de evidencias por categoría |
| `visitors/*.ts` (4 archivos) | Auditoría y similitud de texto |
| `claims.service.ts` | Orquestación del flujo de claims |
| `outbox.service.ts` | Patrón de mensajería transaccional |
| `claims.service.proxy.ts` | Seguridad — control de acceso por rol |

---

## NF7. CI/CD — GitHub Actions

**Estado:** No hay pipelines. No se ejecutan tests automáticamente.

**Archivo a crear:** `.github/workflows/ci.yml`

Workflow mínimo:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_PASSWORD: test }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
        working-directory: services/claims-service
      - run: npm run test
        working-directory: services/claims-service
```

---

## Resumen

| # | Funcionalidad | Archivos a crear | Archivos a modificar | Esfuerzo |
|---|--------------|------------------|---------------------|----------|
| NF1 | Objects CRUD | 3 DTOs | controller, service, module | ~3h |
| NF2 | Paginación | — | controllers (claims, objects, audit) | ~1h |
| NF3 | GET /claims/my | — | controller, service | ~1h |
| NF4 | Swagger/OpenAPI | — | main.ts, controllers | ~2h |
| NF5 | Health audit-service | — | app.controller, docker-compose | ~30min |
| NF6 | Tests | ~15 test files | — | ~6h |
| NF7 | CI/CD | .github/workflows/ci.yml | — | ~1h |
