# Backend Fixes — Solo Arreglos

> **Proyecto:** Lost & Found Uninorte
> **Branch:** `entrega-final`
> **Propósito:** Solo código existente que está **roto** y produce comportamiento incorrecto. No incluye funcionalidad nueva.
> **Regla:** Si no está implementado, no va aquí. Va en `BACKEND_MISSING_FEATURES.md`.

---

## Código que está roto y hay que arreglar

### F1. `ValidationPipe` no está configurado — validaciones inertes

**Servicios:** claims-service + audit-service

**Problema:** Falta `app.useGlobalPipes(new ValidationPipe())`. Todos los decoradores `@IsString()`, `@IsEnum()`, `@ValidateNested()`, `@IsOptional()`, `@IsNotEmpty()` en los DTOs **no ejecutan ninguna validación**. El backend acepta cualquier payload sin verificar.

**Impacto:** Se crean claims con datos inválidos, categorías inexistentes, evidencias sin tipo. Errores 500 internos en vez de 400 con mensajes claros.

**Archivos a modificar:**
- `services/claims-service/src/infrastructure/main.ts` — agregar `app.useGlobalPipes(...)` tras crear la app
- `services/audit-service/src/main.ts` — idem

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

**Verificación:**
- `POST /claims` con body `{}` → responde `400`, no `201`
- `POST /claims` con `status: 'INVALIDO'` → responde `400`

---

### F2. Mismatch Prisma Schema / ACL — response con `undefined`

**Problema:** El modelo `Object` en Prisma no tiene campos `name` ni `status`, pero el Anti-Corruption Layer (`ClaimResponseDto`) los referencia. Toda respuesta de claims incluye `"name": undefined` y `"status": undefined`.

**Archivos a modificar:**
- `services/claims-service/prisma/schema.prisma` — al modelo `Object` agregar:
  ```prisma
  name        String
  status      String   @default("AVAILABLE")
  ```
- Crear migración: `npx prisma migrate dev --name add_object_name_status`
- `services/claims-service/prisma/seed.cjs` — agregar `name` y `status` a los objetos del seed

**Dependencias:** F5 (seed data desactualizada)

---

### F3. Doble emisión de eventos de auditoría

**Problema:** El interceptor `audit-log.interceptor.ts` emite directo a RabbitMQ (`this.client.emit(...)`) **Y** el `ClaimsService` encola eventos via Outbox. Cada acción produce **2 eventos idénticos**, rompiendo la cadena de hashes del audit-service.

**Archivo a modificar:**
- `services/claims-service/src/application/interceptors/audit-log.interceptor.ts`:
  - Eliminar `this.client.emit('audit.event.created', eventData)` (línea 91)
  - El outbox es la vía transaccional correcta

**Verificación:**
- Crear un claim → tabla `OutboxEvent` tiene 1 evento PENDING
- RabbitMQ recibe 1 mensaje
- `AuditLog` en audit-db tiene 1 entrada (no 2)

---

### F4. Sin ownership checks en update/delete — brecha de seguridad

**Problema:**
- `update()` y `remove()` en `claims.service.ts` no verifican que `claim.userId === authenticatedUserId`. Solo verifican que el claim esté en estado PENDING.
- `create()` no valida que el `userId` del body coincida con el `x-user-id` del header.

**Impacto:** Estudiante A puede modificar o eliminar reclamos del Estudiante B. Se puede crear un claim a nombre de otro usuario.

**Archivo a modificar:** `services/claims-service/src/application/services/claims.service.ts`

```ts
// En update() y remove(), antes de cualquier lógica:
if (claim.userId !== actorId) {
  throw new ForbiddenException('No puedes modificar un reclamo que no te pertenece');
}
```

```ts
// En create() del controller:
if (dto.userId !== userId) {  // userId = x-user-id header
  throw new ForbiddenException('No puedes crear un reclamo a nombre de otro usuario');
}
```

---

### F5. Seed data insuficiente — no se puede probar el sistema

**Problemas:**
- Solo **1 usuario** (student@uninorte.edu.co) — **sin admin** para probar endpoints de administración
- Solo **2 objetos** (ELECTRONIC + COMMON) — faltan 5 categorías
- **Cero claims, cero evidences** — el core del sistema no se puede probar
- **Cero audit logs** — audit-service no se puede probar
- Dos archivos semilla: `seed.ts` (muerto) y `seed.cjs` (activo) — duplicación

**Archivos a modificar:**
- `services/claims-service/prisma/seed.cjs`:
  - Agregar usuario ADMIN (`role: 'ADMIN'`)
  - Agregar objetos de todas las categorías (mínimo 1 por categoría, incluido 1 sin foto)
  - Agregar claims de ejemplo con evidences en estados PENDING, APPROVED, REJECTED
- Eliminar `services/claims-service/prisma/seed.ts` (duplicado muerto)
- Crear `services/audit-service/prisma/seed.ts` con entradas de audit log encadenadas

---

### F6. `rejectionReason` no está en `UpdateClaimDto` — se pierde silenciosamente

**Problema:** El DTO `UpdateClaimDto` solo declara `status`. Si se agrega `whitelist: true` en el ValidationPipe (como debe ser), el campo `rejectionReason` que envía el frontend se elimina silenciosamente. El admin escribe una razón de rechazo que nunca se guarda.

**Archivo a modificar:** `services/claims-service/src/application/dto/update-claim.dto.ts`

```ts
export class UpdateClaimDto {
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
```

---

### F7. Evidence `type` es string libre — no hay validación de tipos válidos

**Problema:** El campo `type` en `EvidenceDto` es `@IsString()` sin restricción de valores válidos. Se puede enviar `type: 'CUALQUIER_COSA'` y pasa la validación (o pasaría si F1 estuviera arreglado). El error solo se detecta más adentro como un 500.

**Archivo a modificar:** `services/claims-service/src/application/dto/create-claim.dto.ts`

Agregar enum y cambiar validación:
```ts
export enum EvidenceType {
  SERIAL_NUMBER = 'SERIAL_NUMBER',
  DIGITAL_INVOICE = 'DIGITAL_INVOICE',
  DETAILED_DESCRIPTION = 'DETAILED_DESCRIPTION',
  REFERENCE_PHOTO = 'REFERENCE_PHOTO',
  LOCATION_DETAIL = 'LOCATION_DETAIL',
}

export class EvidenceDto {
  @IsEnum(EvidenceType)
  type: EvidenceType;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
```

---

### F8. Falta `@ArrayMinSize(1)` y `@IsArray()` en evidences — arreglo vacío permitido

**Problema:** `CreateClaimDto.evidences` tiene `@ValidateNested({ each: true })` pero no `@ArrayMinSize(1)` ni `@IsArray()`. Se puede crear un claim sin ninguna evidencia, y el tipo del campo no se valida como array.

**Archivo a modificar:** `services/claims-service/src/application/dto/create-claim.dto.ts`

```ts
@IsArray()
@ValidateNested({ each: true })
@ArrayMinSize(1)
@Type(() => EvidenceDto)
evidences: EvidenceDto[];
```

---

### F9. Race condition en Outbox — eventos duplicados o perdidos

**Problema:** `reserveBatch()` en `outbox.service.ts` usa `findMany` sin lock, luego `updateMany` con locking optimista. Dos instancias concurrentes leen el mismo batch; solo una gana cada fila, pero hay condición de carrera.

**Archivo a modificar:** `services/claims-service/src/application/services/outbox.service.ts`

Reemplazar con query atómica:
```ts
async reserveBatch(batchSize: number = 10): Promise<OutboxEvent[]> {
  return this.prisma.$queryRaw<OutboxEvent[]>`
    UPDATE "OutboxEvent"
    SET status = 'PROCESSING', "updatedAt" = NOW()
    WHERE id IN (
      SELECT id FROM "OutboxEvent"
      WHERE status IN ('PENDING', 'FAILED')
      ORDER BY "createdAt" ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
  `;
}
```

---

### F10. Eventos PROCESSING huérfanos — sin recuperación

**Problema:** El WHERE de `reserveBatch()` solo consulta `PENDING` o `FAILED`. Si el publisher crashea, un evento en `PROCESSING` queda **atascado para siempre**. No hay timeout.

**Archivo a modificar:** Incluido en F9 — agregar al WHERE:
```sql
OR (status = 'PROCESSING' AND "nextAttemptAt" < NOW() - INTERVAL '5 minutes')
```

---

### F11. Sin global exception filter — errores 500 con internals

**Problema:** El único filter existente (`forbidden-exception.filter.ts`) solo maneja `ForbiddenException`. Prisma errors (`P2002`, `P2025`) y otros `HttpException` pasan sin manejo, devolviendo errores 500 genéricos con detalles internos (SQL, stack traces).

**Archivos a crear/modificar:**
- Crear `services/claims-service/src/infrastructure/common/filters/global-exception.filter.ts`
- Registrar en `main.ts`: `app.useGlobalFilters(new GlobalExceptionFilter())`

```ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = 409;
        message = 'Ya existe un recurso con esos datos';
      } else if (exception.code === 'P2025') {
        status = 404;
        message = 'Recurso no encontrado';
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

### F12. EvidenceMatchHandler incompatible con ElectronicClaimFactory — falsos rechazos

**Problema:** `evidence-match.handler.ts` solo acepta `SERIAL_NUMBER` como evidencia válida. `electronic-claim.factory.ts` permite `SERIAL_NUMBER` **O** `DIGITAL_INVOICE`. Un claim con factura digital se crea exitosamente pero **siempre falla** en verificación.

**Archivo a modificar:** `services/claims-service/src/application/handlers/evidence-match.handler.ts`

```ts
// Tipos de evidencia válidos para electrónicos
const VALID_ELECTRONIC_EVIDENCE = ['SERIAL_NUMBER', 'DIGITAL_INVOICE'];

async handle(context: ClaimVerificationContext): Promise<void> {
  const category = context.object.category;
  const validTypes = category === 'ELECTRONIC'
    ? VALID_ELECTRONIC_EVIDENCE
    : ['DETAILED_DESCRIPTION', 'REFERENCE_PHOTO'];

  const hasValidEvidence = context.claim.evidences.some(
    e => validTypes.includes(e.type.trim().toUpperCase())
  );

  if (!hasValidEvidence) {
    throw new ClaimVerificationException(
      'La evidencia no corresponde al tipo de objeto'
    );
  }
}
```

---

### F13. Sin índices en la BD — queries lentas

**Problema:** No hay índices en campos consultados frecuentemente: `userId`, `objectId`, `status`, `category`, `location`, `foundAt`, `evidence.claimId`.

**Archivo a modificar:** `services/claims-service/prisma/schema.prisma`

```prisma
model Object {
  // ... campos existentes ...
  @@index([category])
  @@index([location])
  @@index([foundAt])
}

model Claim {
  // ... campos existentes ...
  @@index([userId])
  @@index([objectId])
  @@index([status])
  @@index([objectId, status])
}

model Evidence {
  // ... campos existentes ...
  @@index([claimId])
}
```

Crear migración: `npx prisma migrate dev --name add_indexes`

---

### F14. Sin `@@unique([userId, objectId])` en Claim — claims duplicados

**Problema:** No hay restricción unique compuesta. Un usuario puede crear múltiples claims para el mismo objeto.

**Archivo a modificar:** `services/claims-service/prisma/schema.prisma` (modelo `Claim`)

```prisma
@@unique([userId, objectId])
```

Incluir en la misma migración de F13.

---

### F15. Sin query param validation en audit controller — filtro silencioso roto

**Problema:** `audit-log.controller.ts` hace `AuditAction[action]` y si el string es inválido devuelve `undefined`, el query `where: { action: undefined }` retorna todos los registros en vez de error.

**Archivo a modificar:** `services/audit-service/src/infrastructure/controllers/audit-log.controller.ts`

```ts
@Get('action/:action')
async getActionsByType(@Param('action') action: string) {
  if (!Object.values(AuditAction).includes(action as AuditAction)) {
    throw new BadRequestException(`Acción inválida: ${action}`);
  }
  // ... resto
}
```

---

### F16. Empty `UpdateClaimDto` permitido — auditoría innecesaria

**Problema:** Llamar `PATCH /claims/:id` con body `{}` (todos los campos opcionales) pasa validación, actualiza nada, pero **aún así dispara un evento de auditoría**.

**Archivo a modificar:** `services/claims-service/src/application/services/claims.service.ts`

```ts
async update(id: string, dto: UpdateClaimDto, actorId: string): Promise<Claim> {
  // Validar que al menos un campo venga para actualizar
  if (Object.keys(dto).length === 0) {
    throw new BadRequestException('Debe enviar al menos un campo para actualizar');
  }
  // ... resto
}
```

---

### F17. Two conflicting seed files — `seed.ts` vs `seed.cjs`

**Problema:** Existen `prisma/seed.ts` y `prisma/seed.cjs`. `package.json` apunta a `seed.cjs`, así que `seed.ts` es código muerto que confunde.

**Archivo a eliminar:** `services/claims-service/prisma/seed.ts`

---

### F18. `ServiceDiscovery` usa `require()` en entorno ESM/TypeScript

**Problema:** `const Consul = require('consul')` mezcla módulos CommonJS en un códigobase TypeScript ESM. Sin `@types/consul` en devDependencies.

**Archivo a modificar:** `services/claims-service/src/infrastructure/service-discovery/service-discovery.service.ts`

```ts
import Consul from 'consul';  // con types adecuados
```

---

### F19. Race condition en audit chain insertion

**Problema:** `verifyIntegrity()` en `audit-log.service.ts` lee entradas sin transacción explícita. Aunque `appendWithChain()` ya usa `FOR UPDATE` para serializar escrituras, la verificación de integridad no está envuelta en una transacción de solo lectura, lo que en teoría podría ver un estado inconsistente bajo concurrencia extrema. Impacto real es bajo porque el audit log es append-only y PostgreSQL read-committed no muestra filas no commiteadas.

**Archivo a modificar:** `services/audit-service/src/application/services/audit-log.service.ts`

Opcional: envolver el `findAllOrdered()` en una transacción de solo lectura para mayor seguridad.

---

### F20. `ACCESSORY` usa `ElectronicClaimFactory` pero el handler lo trata como genérico — falso rechazo

**Problema:** `ClaimFactoryProvider` (`claim-factory.provider.ts`) rutea `ACCESSORY` a `ElectronicClaimFactory` (espera `SERIAL_NUMBER` o `DIGITAL_INVOICE`). Pero `EvidenceMatchHandler` solo trata `ELECTRONIC` como categoría electrónica; todo lo demás (incluyendo `ACCESSORY`) espera `DETAILED_DESCRIPTION` o `REFERENCE_PHOTO`. Un claim para un accesorio con serial/serie se crea pero **siempre falla** en verificación.

**Impacto:** Falsos rechazos garantizados para la categoría ACCESSORY.

**Archivos a modificar:**
- `services/claims-service/src/infrastructure/objects/claim-factory.provider.ts` — corregir ruteo de ACCESSORY
- `services/claims-service/src/application/handlers/evidence-match.handler.ts` — alinear lógica de categorías

**Solución:** Decidir si ACCESSORY es electrónico o común, y alinear factory + handler consistentemente.

---

### F21. `objectCategory` en DTO no se valida contra el objeto real en BD

**Problema:** `CreateClaimDto.objectCategory` es un campo que el cliente envía. El servicio usa ese valor (no el de la BD) para elegir el factory de validación. Un cliente puede enviar `category: 'COMMON'` para un objeto `ELECTRONIC` real y evadir la validación de evidencias estrictas.

**Impacto:** La validación de evidencias se puede eludir completamente.

**Archivo a modificar:** `services/claims-service/src/application/services/claims.service.ts`

**Solución:** En `create()`, leer el objeto real de la BD (`GET /objects/:id`) y usar su categoría real, no la del cliente.

---

### F22. Claims creados para usuarios que no existen en DB

**Problema:** `ClaimsService.create()` valida que el objeto exista y tenga foto, pero **nunca verifica que el `userId` exista** en la tabla `User`. El `IdentityHandler` solo se ejecuta durante la verificación del admin, no en la creación.

**Impacto:** Se pueden crear claims huérfanos asociados a IDs de usuario inexistentes.

**Archivo a modificar:** `services/claims-service/src/application/services/claims.service.ts`

**Solución:** Validar existencia del `userId` en la tabla `User` antes de crear el claim. F4 (header check) reduce el riesgo pero no lo elimina si el userId es válido pero no existe.

---

### F23. `remove()` omite el ACL — posible leak de datos internos

**Problema:** `ClaimsController.remove()` (línea 112) retorna el resultado crudo de Prisma. A diferencia de `create()`, `update()` y `findOne()`, no pasa por `antiCorruptionLayer.toClaimResponse()`.

**Archivo a modificar:** `services/claims-service/src/infrastructure/controllers/claims.controller.ts`

**Solución:** Envolver el resultado con `antiCorruptionLayer.toClaimResponse()`.

---

### F24. `EvidenceDto.description` es `@IsOptional()` pero el factory lo requiere como obligatorio

**Problema:** `EvidenceDto.description` tiene `@IsOptional()` en el DTO, pero `CommonClaimFactory.validateEvidences()` lo requiere como truthy cuando el tipo es `DETAILED_DESCRIPTION`. Las capas de validación se contradicen.

**Archivos a modificar:**
- `services/claims-service/src/application/dto/create-claim.dto.ts` — cambiar `@IsOptional()` a `@IsNotEmpty()`
- O mantener opcional pero alinear el factory para que acepte description vacía

---

### F25. CORS sin restricción de origen

**Problema:** `claims-service/src/infrastructure/main.ts` (línea 7) tiene `app.enableCors()` sin opciones. Permite cualquier origen en un sistema universitario con datos sensibles.

**Archivo a modificar:** `services/claims-service/src/infrastructure/main.ts`

**Solución:**
```ts
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
});
```

---

### F26. Health check de audit-service golpea endpoint de datos

**Problema:** `docker-compose.yml` (línea 141) usa `wget ... /audit-log` como health check. Esto consulta la BD cada 10 segundos, genera carga innecesaria e infla el audit log si el endpoint registra accesos.

**Archivo a modificar:** `docker-compose.yml`

**Solución:** Una vez implementado NF5 (health endpoint en audit-service), cambiar el health check a `wget --spider http://localhost:3001/health`.

---

### F27. `Object` del modelo Prisma shadowea el global de JS

**Problema:** `claim-verification.types.ts` importa `Object` de `@prisma/client`, que shadowea el constructor global `Object` de JavaScript. Puede causar problemas sutiles con tooling o en runtime.

**Archivo a modificar:** `services/claims-service/src/application/handlers/claim-verification.types.ts`

**Solución:** Usar alias en el import: `import { Object as PrismaObject } from '@prisma/client'`

---

### F28. `@IsArray()` faltante en `CreateClaimDto.evidences`

**Problema:** Además de la falta de `@ArrayMinSize(1)` documentada en F8, tampoco hay `@IsArray()`. Sin este decorador, `class-validator` no valida que el valor sea efectivamente un array.

**Archivo a modificar:** `services/claims-service/src/application/dto/create-claim.dto.ts` (incluido en la solución de F8)

---

| Archivo | Fix(es) |
|---------|---------|
| `services/claims-service/src/infrastructure/main.ts` | F1+F25: ValidationPipe + CORS con origen |
| `services/audit-service/src/main.ts` | F1: ValidationPipe |
| `services/claims-service/prisma/schema.prisma` | F2+F13+F14: Campos faltantes, índices, unique |
| `services/claims-service/prisma/seed.cjs` | F5: Seed data completa |
| `services/claims-service/prisma/seed.ts` | F17: Eliminar (duplicado muerto) |
| `services/audit-service/prisma/seed.ts` | F5: Crear seed |
| `services/claims-service/src/application/interceptors/audit-log.interceptor.ts` | F3: Eliminar doble emisión |
| `services/claims-service/src/application/services/claims.service.ts` | F4+F16+F21+F22: Ownership checks, body vacío, validar categoría real, validar userId existe |
| `services/claims-service/src/application/services/outbox.service.ts` | F9+F10: FOR UPDATE SKIP LOCKED, timeout PROCESSING |
| `services/claims-service/src/application/dto/create-claim.dto.ts` | F7+F8+F24+F28: EvidenceType enum, @ArrayMinSize, @IsArray(), description consistente |
| `services/claims-service/src/application/dto/update-claim.dto.ts` | F6: Agregar rejectionReason |
| `services/claims-service/src/application/handlers/evidence-match.handler.ts` | F12+F20: Sincronizar con factory, corregir categoría ACCESSORY |
| `services/claims-service/src/infrastructure/common/filters/global-exception.filter.ts` | F11: Crear global exception filter |
| `services/claims-service/src/infrastructure/controllers/claims.controller.ts` | F23: Envolver remove() en ACL |
| `services/claims-service/src/infrastructure/objects/claim-factory.provider.ts` | F20: Corregir ruteo ACCESSORY |
| `services/claims-service/src/application/handlers/claim-verification.types.ts` | F27: Alias import Object |
| `services/audit-service/src/infrastructure/controllers/audit-log.controller.ts` | F15: Validar query params |
| `services/claims-service/src/infrastructure/service-discovery/service-discovery.service.ts` | F18: Import en vez de require |
| `services/audit-service/src/application/services/audit-log.service.ts` | F19: Transacción en verifyIntegrity |
| `docker-compose.yml` | F26: Health check audit-service |

---

## Checklist de verificación post-fixes

- [ ] `POST /claims` con body `{}` → 400
- [ ] `POST /claims` con datos válidos → 201 + 1 outbox event
- [ ] `POST /claims` con `objectCategory` distinto al objeto real → usa la categoría real de BD
- [ ] `POST /claims` con `userId` que no existe en DB → 400
- [ ] `POST /claims` con `evidences: []` → 400 (F8+F28)
- [ ] `POST /claims` con `type: 'INVALIDO'` → 400 (F7)
- [ ] `POST /claims` con `userId` distinto al header → 403 (F4)
- [ ] `GET /objects` devuelve objetos con `name` y `status` (F2)
- [ ] `GET /claims/:id/audit` genera 1 audit log (no 2) (F3)
- [ ] Estudiante A NO puede modificar/eliminar claims de Estudiante B (F4)
- [ ] `PATCH /claims/:id` con `{ rejectionReason: "..." }` guarda el campo (F6)
- [ ] `PATCH /claims/:id` con `{}` → 400 (F16)
- [ ] `DELETE /claims/:id` retorna respuesta sanitizada por ACL (F23)
- [ ] Objeto sin foto → 400 (regla de negocio)
- [ ] Claim ACCESSORY se puede verificar sin falso rechazo (F20)
- [ ] `GET /audit-log/action/INVALID` → 400 (F15)
- [ ] `GET /audit-log/verify-integrity` → `{ valid: true }` (F19)
- [ ] CORS solo permite orígenes configurados (F25)
- [ ] Health check audit-service usa `/health` no `/audit-log` (F26)
- [ ] Seed: existe usuario admin + objetos de todas las categorías + claims de ejemplo (F5)
- [ ] Solo un archivo seed (`seed.cjs`) (F17)
- [ ] `Object` de Prisma no shadowea global de JS (F27)
