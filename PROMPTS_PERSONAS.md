# Prompts por Persona — Lost & Found Uninorte

> **Instrucción general:** Cada prompt está diseñado para entregarse a un desarrollador (o a una IA) para que ejecute sus tareas de forma autónoma. Todos deben leer los archivos de documentación indicados, seguir las reglas de convivencia entre personas, y **probar cada cambio antes de darlo por terminado**.

---

## 📌 Reglas globales para todas las personas

1. **Commits atómicos**: un commit por fix/feature con mensaje descriptivo
2. **No rompas el build**: antes de commit, verifica que `npm run build` compile
3. **Tests**: cada tarea incluye "Para probar:" — ejecútalo antes de marcar como done
4. **Archivos compartidos**: si necesitas tocar un archivo que的另一 persona también modifica, coordina el merge
5. **Seed**: si agregas campos a la BD, actualiza el seed inmediatamente
6. **No hagas trabajo de otra persona**: si ves algo que no está en tu lista, reportalo, no lo implementes

---

## Persona 1 — Backend Core: Validación, Seguridad y Schema

### Misión
Eres el encargado de la base del backend. Sin tu trabajo, nada funciona. Tienes **propiedad exclusiva de `schema.prisma`** — nadie más toca ese archivo. Los demás te pasan requisitos y tú los implementas en una sola migración.

### Archivos que debes leer primero
1. `docs/BACKEND_FIXES.md` — enfócate en F1, F2, F4, F11, F13, F14, F21, F22, F23, F25, F27
2. `PLAN_TRABAJO_5_PERSONAS.md` — entiende tu rol y las reglas de convivencia

### Tareas

#### T1. ValidationPipe global (F1)
**Archivos:** `services/claims-service/src/infrastructure/main.ts`, `services/audit-service/src/main.ts`

Agrega `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))` en ambos servicios. En claims-service va después de `app.setGlobalPrefix('api')` (línea 5 aprox). En audit-service va justo después de `const app = await NestFactory.create(AppModule)`.

**Para probar:**
```bash
# Sin ValidationPipe, POST /claims con body {} devuelve 201
# Con ValidationPipe, debe devolver 400
curl -X POST http://localhost:3000/api/claims -H "Content-Type: application/json" -d "{}" -H "x-user-role: STUDENT" -H "x-user-id: student-001"
# Expected: 400 Bad Request con mensaje de validación
```

#### T2. Agregar name + status al modelo Object + migración (F2)
**Archivo:** `services/claims-service/prisma/schema.prisma`

En el modelo `Object`, agrega:
```prisma
name        String
status      String   @default("AVAILABLE")
```

Actualiza también `services/claims-service/prisma/seed.cjs` para incluir `name` y `status` en los objetos del seed.

```bash
npx prisma migrate dev --name add_object_name_status
```

**Para probar:**
```bash
curl http://localhost:3000/api/objects
# Expected: cada objeto debe tener "name" y "status" (no undefined)
```

#### T3. Índices + unique constraint (F13 + F14)
**Archivo:** `services/claims-service/prisma/schema.prisma`

P3 te pasó estos requisitos. Agrégarlos al modelo existente:

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
  @@unique([userId, objectId])
}

model Evidence {
  // ... campos existentes ...
  @@index([claimId])
}
```

```bash
npx prisma migrate dev --name add_indexes_and_constraints
```

**Para probar:**
```bash
# Verifica que la migración se aplica sin errores
npx prisma migrate deploy
# Expected: migraciones aplicadas correctamente
```

#### T4. Ownership checks en update/delete/create (F4)
**Archivo:** `services/claims-service/src/application/services/claims.service.ts`

En los métodos `update()` y `remove()`, antes de cualquier lógica, agrega:
```ts
const claim = await this.prisma.claim.findUniqueOrThrow({ where: { id } });
if (claim.userId !== actorId) {
  throw new ForbiddenException('No puedes modificar un reclamo que no te pertenece');
}
```

En `services/claims-service/src/infrastructure/controllers/claims.controller.ts`, en `create()`:
```ts
@Post()
async create(@Body() dto: CreateClaimDto, @Headers('x-user-id') userId: string) {
  if (dto.userId !== userId) {
    throw new ForbiddenException('No puedes crear un reclamo a nombre de otro usuario');
  }
  // ... resto
}
```

Asegúrate de pasar `actorId` a `update()` y `remove()` en el service. Actualiza las firmas de los métodos para recibir el parámetro.

**Para probar:**
```bash
# Estudiante A intenta modificar claim del Estudiante B
curl -X PATCH http://localhost:3000/api/claims/CLAIM_B_ID \
  -H "x-user-id: student-A" -H "x-user-role: STUDENT" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
# Expected: 403 Forbidden
```

#### T5. Global exception filter (F11)
**Crear:** `services/claims-service/src/infrastructure/common/filters/global-exception.filter.ts`
**Modificar:** `services/claims-service/src/infrastructure/main.ts`

```ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un recurso con esos datos';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Recurso no encontrado';
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
```

Registrar en `main.ts`:
```ts
app.useGlobalFilters(new GlobalExceptionFilter());
```

**Para probar:**
```bash
# Request a un recurso que no existe
curl http://localhost:3000/api/claims/id-inexistente -H "x-user-id: student-001" -H "x-user-role: STUDENT"
# Expected: 404 con mensaje "Recurso no encontrado" (no un 500 con stack trace)
```

#### T6. Validar objectCategory contra la BD (F21)
**Archivo:** `services/claims-service/src/application/services/claims.service.ts`

En `create()`, después de validar que el objeto existe, usa la categoría real del objeto (no la del cliente) para elegir el factory:

```ts
// Reemplazar el uso de dto.objectCategory con:
const object = await this.prisma.object.findUniqueOrThrow({ where: { id: dto.objectId } });
const category = object.category;  // ← usar la categoría real de la BD
```

Si el cliente envió `objectCategory: 'COMMON'` pero el objeto es `ELECTRONIC`, se debe usar `ELECTRONIC`.

**Para probar:**
```bash
# Crear claim para objeto ELECTRONIC pero enviando objectCategory: "COMMON"
# Debe usar la categoría real (ELECTRONIC) y aplicar validación de evidencias electrónicas
# Expected: comportarse como ELECTRONIC, no como COMMON
```

#### T7. Validar que userId exista (F22)
**Archivo:** `services/claims-service/src/application/services/claims.service.ts`

En `create()`, antes de crear el claim:
```ts
const userExists = await this.prisma.user.findUnique({ where: { id: dto.userId } });
if (!userExists) {
  throw new BadRequestException('El usuario especificado no existe');
}
```

**Para probar:**
```bash
curl -X POST http://localhost:3000/api/claims -H "Content-Type: application/json" \
  -H "x-user-id: student-001" -H "x-user-role: STUDENT" \
  -d '{"objectId": "real-object-id", "userId": "non-existent-user", "evidences": [...]}'
# Expected: 400 Bad Request "El usuario especificado no existe"
```

#### T8. Envolver remove() en ACL (F23)
**Archivo:** `services/claims-service/src/infrastructure/controllers/claims.controller.ts`

```ts
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
  await this.claimsService.remove(id, userId);
  // No retornar el resultado crudo de Prisma
}
```

O si retorna algo, pasarlo por `antiCorruptionLayer.toClaimResponse()`.

**Para probar:**
```bash
# Eliminar un claim y verificar que la respuesta no contiene campos internos de Prisma
# Expected: respuesta limpia (204 No Content o response sanitizada)
```

#### T9. CORS con origen restringido (F25)
**Archivo:** `services/claims-service/src/infrastructure/main.ts`

```ts
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
```

**Para probar:**
```bash
# Request desde un origen no permitido debe ser bloqueado por CORS
curl -H "Origin: https://evil-site.com" -H "x-user-id: test" -H "x-user-role: STUDENT" \
  http://localhost:3000/api/objects
# Expected: Sin el header Access-Control-Allow-Origin
```

#### T10. Alias Object de Prisma (F27)
**Archivo:** `services/claims-service/src/application/handlers/claim-verification.types.ts`

```ts
import { Object as PrismaObject } from '@prisma/client';
// Usar PrismaObject en vez de Object para evitar shadowear el global
```

**Para probar:** El código debe compilar sin warnings. `npm run build` debe pasar limpio.

### Do NOT
- No modifiques `outbox.service.ts` (es de P3)
- No modifiques DTOs (create-claim.dto.ts, update-claim.dto.ts) sin coordinar con P2
- No modifiques handlers (evidence-match, identity, availability) — esos son de P2
- No agregues nuevas funcionalidades (solo fixes)

### Criterios de éxito
- [ ] `POST /claims` con body `{}` → 400
- [ ] `POST /claims` con userId inexistente → 400
- [ ] `POST /claims` con userId de otro → 403
- [ ] `PATCH /claims/:id` de otro usuario → 403
- [ ] `DELETE /claims/:id` de otro usuario → 403
- [ ] `GET /claims/:id` inexistente → 404 con mensaje limpio
- [ ] `GET /objects` devuelve `name` y `status` (no undefined)
- [ ] CORS bloquea orígenes no configurados
- [ ] Una sola migración con schema completo (name, status, índices, unique)

### Deliverables
Commit con mensaje: `fix(backend): validations, schema, security, CORS, exception filter`

---

## Persona 2 — Backend API: Domain Patterns, DTOs, Swagger, Health, Tests

### Misión
Eres el encargado de la lógica de negocio: DTOs, validación de evidencias, handlers del Chain of Responsibility, factories, visitors. También implementas Swagger, health endpoint para audit-service, y tests de handlers/factories. **No toques `schema.prisma` ni `claims.service.ts`.**

### Archivos que debes leer primero
1. `docs/BACKEND_FIXES.md` — enfócate en F3, F6, F7, F8, F12, F19, F20, F24, F28
2. `docs/BACKEND_MISSING_FEATURES.md` — NF4 (Swagger), NF5 (Health)
3. `PLAN_TRABAJO_5_PERSONAS.md` — tu rol y dependencias con P1

### Tareas

#### T1. Eliminar doble emisión de auditoría (F3)
**Archivo:** `services/claims-service/src/application/interceptors/audit-log.interceptor.ts`

Elimina la línea `this.client.emit('audit.event.created', eventData)` (aproximadamente línea 91). El outbox en `claims.service.ts` ya se encarga de encolar el evento. Si el interceptor queda sin emisión directa, considerar si aún tiene propósito (metadata de request: IP, user-agent).

**Para probar:**
```bash
# 1. Crear un claim
# 2. Revisar tabla OutboxEvent — debe haber 1 evento PENDING
# 3. Revisar cola RabbitMQ — debe llegar 1 mensaje
# 4. Revisar tabla AuditLog en audit-db — debe haber 1 entrada (no 2)
```

#### T2. Agregar rejectionReason a UpdateClaimDto (F6)
**Archivo:** `services/claims-service/src/application/dto/update-claim.dto.ts`

```ts
import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { ClaimStatus } from '@prisma/client';

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

**Para probar:**
```bash
curl -X PATCH http://localhost:3000/api/claims/CLAIM_ID \
  -H "x-user-id: student-001" -H "x-user-role: STUDENT" \
  -H "Content-Type: application/json" \
  -d '{"status": "REJECTED", "rejectionReason": "La evidencia no corresponde al objeto"}'
# Expected: 200 OK, campo rejectionReason guardado en BD
```

#### T3. Enum EvidenceType + validación (F7)
**Archivo:** `services/claims-service/src/application/dto/create-claim.dto.ts`

Crea el enum y actualiza EvidenceDto:

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

**Para probar:**
```bash
curl -X POST http://localhost:3000/api/claims -H "Content-Type: application/json" \
  -H "x-user-id: student-001" -H "x-user-role: STUDENT" \
  -d '{"objectId": "...", "userId": "student-001", "evidences": [{"type": "INVALID_TYPE", "description": "test"}]}'
# Expected: 400 Bad Request "type must be a valid enum value"
```

#### T4. @IsArray + @ArrayMinSize en evidences (F8+F28)
**Archivo:** `services/claims-service/src/application/dto/create-claim.dto.ts`

```ts
@IsArray()
@ValidateNested({ each: true })
@ArrayMinSize(1)
@Type(() => EvidenceDto)
evidences: EvidenceDto[];
```

**Para probar:**
```bash
curl -X POST http://localhost:3000/api/claims -H "Content-Type: application/json" \
  -H "x-user-id: student-001" -H "x-user-role: STUDENT" \
  -d '{"objectId": "...", "userId": "student-001", "evidences": []}'
# Expected: 400 Bad Request "evidences must contain at least 1 elements"
```

#### T5. Sincronizar EvidenceMatchHandler con ElectronicClaimFactory (F12)
**Archivo:** `services/claims-service/src/application/handlers/evidence-match.handler.ts`

El handler actual solo acepta `SERIAL_NUMBER`. Debe aceptar también `DIGITAL_INVOICE`:

```ts
const VALID_EVIDENCE_TYPES: Record<string, string[]> = {
  ELECTRONIC: ['SERIAL_NUMBER', 'DIGITAL_INVOICE'],
  DEFAULT: ['DETAILED_DESCRIPTION', 'REFERENCE_PHOTO'],
};

async handle(context: ClaimVerificationContext): Promise<void> {
  const category = context.object.category;
  const validTypes = VALID_EVIDENCE_TYPES[category] || VALID_EVIDENCE_TYPES.DEFAULT;

  const hasValidEvidence = context.claim.evidences.some(
    e => validTypes.includes(e.type.trim().toUpperCase())
  );

  if (!hasValidEvidence) {
    throw new ClaimVerificationException(
      `La evidencia no corresponde a un objeto de tipo ${category}`
    );
  }
}
```

**Para probar:**
```bash
# Crear claim para objeto ELECTRONIC con evidence type DIGITAL_INVOICE
# Ejecutar POST /claims/:id/verify
# Expected: verificación exitosa (no debe fallar por tipo de evidencia)
```

#### T6. Corregir ruteo de ACCESSORY (F20)
**Archivo:** `services/claims-service/src/infrastructure/objects/claim-factory.provider.ts`

`ACCESSORY` está siendo ruteado a `ElectronicClaimFactory`. Debe ir a `CommonClaimFactory` (a menos que los accesorios electrónicos requieran serial, en cuyo caso alinear también el handler):

```ts
// En claim-factory.provider.ts, corregir el ruteo:
const FACTORY_MAP: Record<string, any> = {
  ELECTRONIC: this.electronicClaimFactory,
  ACCESSORY: this.commonClaimFactory,  // ← cambiar de electronic a common
  // ... resto
};
```

O si se decide que ACCESSORY debe seguir siendo electrónico, entonces actualizar F12 para incluir ACCESSORY en las categorías que aceptan SERIAL_NUMBER.

**Para probar:**
```bash
# Crear claim para objeto ACCESSORY y ejecutar verificación
# Expected: debe pasar verificación sin falso rechazo
```

#### T7. Alinear EvidenceDto.description (F24)
**Archivos:** `services/claims-service/src/application/dto/create-claim.dto.ts`, `services/claims-service/src/application/factories/common-claim.factory.ts`

Decisión: cambiar `description` a `@IsNotEmpty()` (no opcional) y actualizar el factory para que no haga validación redundante. O mantener opcional y alinear el factory.

Solución recomendada: cambiar el DTO a `@IsNotEmpty()` y eliminar la validación redundante del factory.

**Para probar:**
```bash
# Crear claim con evidence description vacío
# Expected: 400 Bad Request
```

#### T8. Transacción en verifyIntegrity (F19)
**Archivo:** `services/audit-service/src/application/services/audit-log.service.ts`

Envolver el `findAllOrdered()` dentro de una transacción de solo lectura:

```ts
async verifyIntegrity(): Promise<{ valid: boolean; entries: number; }> {
  return this.prisma.$transaction(async (tx) => {
    const entries = await tx.auditLog.findMany({ orderBy: { timestamp: 'asc' } });
    // ... lógica de verificación de hashes ...
  }, { isolationLevel: 'Serializable' });
}
```

**Para probar:**
```bash
curl http://localhost:3001/audit-log/verify-integrity
# Expected: { valid: true, entries: N }
```

#### T9. Swagger/OpenAPI (NF4)
**Dependencia:** `npm install @nestjs/swagger`

**Archivo:** `services/claims-service/src/infrastructure/main.ts`

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Lost & Found Uninorte — Claims Service')
  .setDescription('API de gestión de reclamos de objetos perdidos')
  .setVersion('1.0')
  .addApiKey({ type: 'apiKey', name: 'x-user-role', in: 'header' }, 'role')
  .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'userId')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

Decora los controladores principales:
- `ClaimsController` → `@ApiTags('Claims')` + `@ApiOperation()`, `@ApiResponse()` en cada endpoint
- `ObjectsController` → `@ApiTags('Objects')`
- Ídem para audit-service

**Para probar:**
```bash
Abrir http://localhost:3000/api/docs
# Expected: Swagger UI con todos los endpoints documentados
```

#### T10. Health endpoint en audit-service (NF5)
**Archivo:** `services/audit-service/src/app.controller.ts`

```ts
@Get('health')
async health() {
  try {
    await this.prismaService.$queryRaw`SELECT 1`;
    return { status: 'ok', service: 'audit-service', timestamp: new Date().toISOString() };
  } catch {
    return { status: 'degraded', service: 'audit-service', timestamp: new Date().toISOString() };
  }
}
```

**Archivo:** `docker-compose.yml`

Cambiar health check de audit-service de:
```yaml
test: ["CMD", "wget", "--spider", "http://localhost:$${SERVICE_PORT:-3001}/audit-log"]
```
a:
```yaml
test: ["CMD", "wget", "--spider", "http://localhost:$${SERVICE_PORT:-3001}/health"]
```

**Para probar:**
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","service":"audit-service",...}
```

#### T11. Tests unitarios para handlers y factories
Crear tests para:
- `handlers/identity.handler.ts` — usuario existe vs no existe
- `handlers/availability.handler.ts` — objeto disponible vs ya reclamado
- `handlers/evidence-match.handler.ts` — evidencia válida vs inválida
- `factories/electronic-claim.factory.ts` — validación con/sin serial, con/sin factura
- `factories/common-claim.factory.ts` — validación con/sin descripción

**Para probar:**
```bash
cd services/claims-service
npx jest --testPathPattern="(handler|factory)" --verbose
# Expected: todos los tests pasan
```

### Do NOT
- No toques `schema.prisma` (es de P1)
- No toques `claims.service.ts` (es de P1)
- No toques `outbox.service.ts` (es de P3)
- No implementes páginas del frontend

### Criterios de éxito
- [ ] Swagger UI funciona en `/api/docs`
- [ ] Health endpoint audit responde en `/health`
- [ ] EvidenceType enum valida tipos correctamente
- [ ] No hay doble emisión de auditoría
- [ ] ACCESSORY tiene el factory correcto
- [ ] Tests de handlers pasan
- [ ] rejectionReason se guarda correctamente

### Deliverables
Commit con mensaje: `fix(backend): DTOs, handlers, swagger, health endpoint, handler tests`

---

## Persona 3 — Backend Infra: Outbox, Seed, CI/CD, Paginación, Features

### Misión
Eres el encargado de la infraestructura del backend: Outbox Pattern robusto, seed data, paginación, nuevos endpoints (Objects CRUD, GET /claims/my), y CI/CD. **Coordinación clave con P1 para schema y seed.**

### Archivos que debes leer primero
1. `docs/BACKEND_FIXES.md` — F5, F9, F10, F15, F16, F17, F18, F26
2. `docs/BACKEND_MISSING_FEATURES.md` — NF1, NF2, NF3, NF7
3. `PLAN_TRABAJO_5_PERSONAS.md` — tu rol y dependencias

### Tareas

#### T1. Audit-service seed (F5 parcial)
**Crear:** `services/audit-service/prisma/seed.ts`

```ts
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const firstEntry = await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_INIT',
      entityType: 'SYSTEM',
      entityId: '00000000-0000-0000-0000-000000000000',
      actorId: 'system',
      actorRole: 'SYSTEM',
      previousHash: null,
      hash: crypto.createHash('sha256').update('genesis').digest('hex'),
      payload: {},
      result: 'SUCCESS',
      details: 'Sistema inicializado',
    },
  });

  // Crear 2 entradas más encadenadas
  // ... (la segunda apunta a la primera, la tercera a la segunda)
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Actualizar `services/audit-service/package.json`:
```json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

**Para probar:**
```bash
cd services/audit-service
npx prisma db seed
npx prisma studio  # verificar que hay 3+ entradas con hashes encadenados
```

#### T2. Outbox: FOR UPDATE SKIP LOCKED (F9+F10)
**Archivo:** `services/claims-service/src/application/services/outbox.service.ts`

Reemplazar `reserveBatch()` con query atómica:

```ts
async reserveBatch(batchSize: number = 10): Promise<OutboxEvent[]> {
  return this.prisma.$queryRaw<OutboxEvent[]>`
    UPDATE "OutboxEvent"
    SET status = 'PROCESSING', "updatedAt" = NOW()
    WHERE id IN (
      SELECT id FROM "OutboxEvent"
      WHERE status IN ('PENDING', 'FAILED')
         OR (status = 'PROCESSING' AND "nextAttemptAt" < NOW() - INTERVAL '5 minutes')
      ORDER BY "createdAt" ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
  `;
}
```

**Para probar:**
```bash
# 1. Crear un claim (genera outbox event)
# 2. Ejecutar el publisher manualmente o esperar el poll de 5s
# 3. Verificar que el evento pasa de PENDING → PROCESSING → PUBLISHED
# 4. Verificar que el mensaje llega a RabbitMQ (management UI en http://localhost:15672)
```

#### T3. Validar query params audit controller (F15)
**Archivo:** `services/audit-service/src/infrastructure/controllers/audit-log.controller.ts`

En `getActionsByType()`:
```ts
@Get('action/:action')
async getActionsByType(@Param('action') action: string) {
  if (!Object.values(AuditAction).includes(action as AuditAction)) {
    throw new BadRequestException(`Acción inválida: ${action}. Valores válidos: ${Object.values(AuditAction).join(', ')}`);
  }
  return this.auditLogService.getByAction(action as AuditAction);
}
```

**Para probar:**
```bash
curl http://localhost:3001/audit-log/action/INVALID_ACTION
# Expected: 400 Bad Request
```

#### T4. Validar body vacío en UpdateClaimDto (F16)
**Archivo:** `services/claims-service/src/application/services/claims.service.ts`

Después de que P1 haya mergeado sus cambios (F4), agrega al inicio de `update()`:

```ts
if (Object.keys(dto).length === 0) {
  throw new BadRequestException('Debe enviar al menos un campo para actualizar');
}
```

**Para probar:**
```bash
curl -X PATCH http://localhost:3000/api/claims/CLAIM_ID \
  -H "x-user-id: student-001" -H "x-user-role: STUDENT" \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Bad Request
```

#### T5. Eliminar seed.ts duplicado (F17)
```bash
git rm services/claims-service/prisma/seed.ts
```

**Para probar:**
```bash
cd services/claims-service
npm run seed  # debe ejecutar seed.cjs sin errores
```

#### T6. ServiceDiscovery import (F18)
**Archivo:** `services/claims-service/src/infrastructure/service-discovery/service-discovery.service.ts`

Cambiar:
```ts
const Consul = require('consul');
```
a:
```ts
import Consul from 'consul';
```

Y en `package.json`, verificar que `@types/consul` esté en devDependencies. Si no, agregarlo:
```bash
npm install --save-dev @types/consul
```

**Para probar:**
```bash
cd services/claims-service
npm run build  # debe compilar sin errores
```

#### T7. Health check audit-service (F26)
**Archivo:** `docker-compose.yml`

(Primero esperar a que P2 implemente NF5 — health endpoint)

Cambiar:
```yaml
test: ["CMD", "wget", "--spider", "http://localhost:$${SERVICE_PORT:-3001}/audit-log"]
```
a:
```yaml
test: ["CMD", "wget", "--spider", "http://localhost:$${SERVICE_PORT:-3001}/health"]
```

**Para probar:**
```bash
docker-compose ps
# Expected: audit-service debe mostrar "healthy"
```

#### T8. Seed claims-service completo (F5)
**Archivo:** `services/claims-service/prisma/seed.cjs`

(Esperar a que P1 termine F2 — schema con name/status)

Agregar:
- **Usuario ADMIN:** `admin-001`, `admin@uninorte.edu.co`, `role: 'ADMIN'`
- **Usuario STUDENT:** mantener el existente o actualizar
- **Objetos:** mínimo 1 por categoría (ELECTRONIC, CLOTHING, STATIONERY, DOCUMENT, ACCESSORY, OTHER), incluyendo 1 sin foto
- **Claims:** al menos 1 PENDING con evidences, 1 APPROVED, 1 REJECTED con rejectionReason

**Para probar:**
```bash
cd services/claims-service
npx prisma db reset --force  # resetea + ejecuta seed
npx prisma studio  # verificar datos: admin user, objetos todas categorías, claims en 3 estados
```

#### T9. Objects CRUD completo (NF1)
**Crear:**
- `services/claims-service/src/application/dto/create-object.dto.ts`
- `services/claims-service/src/application/dto/update-object.dto.ts`

**Modificar:**
- `services/claims-service/src/infrastructure/objects/objects.controller.ts`
- `services/claims-service/src/infrastructure/objects/objects.service.ts`

Endpoints:
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/objects` | Crear objeto (ADMIN) |
| `PATCH` | `/objects/:id` | Actualizar (ADMIN) |
| `DELETE` | `/objects/:id` | Eliminar (ADMIN) |
| `GET` | `/objects?category=&location=&q=` | Búsqueda filtrada |

**Para probar:**
```bash
# Crear objeto
curl -X POST http://localhost:3000/api/objects -H "Content-Type: application/json" \
  -H "x-user-role: ADMIN" -H "x-user-id: admin-001" \
  -d '{"name":"Laptop Dell","description":"Laptop Dell XPS 15","category":"ELECTRONIC","photo":"https://...","location":"Biblioteca"}'
# Expected: 201 Created

# Buscar por categoría
curl "http://localhost:3000/api/objects?category=ELECTRONIC"
# Expected: solo objetos ELECTRONIC

# Eliminar
curl -X DELETE http://localhost:3000/api/objects/OBJECT_ID \
  -H "x-user-role: ADMIN" -H "x-user-id: admin-001"
# Expected: 200 OK o 204 No Content
```

#### T10. Paginación en claims y objects (NF2)
**Archivos:**
- `services/claims-service/src/infrastructure/controllers/claims.controller.ts`
- `services/claims-service/src/infrastructure/objects/objects.controller.ts`

Agregar query params `page` (default 1) y `limit` (default 20) a `findAll()`:

```ts
@Get()
async findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  @Headers('x-user-role') role: string,
  @Headers('x-user-id') userId: string,
) {
  const skip = (page - 1) * limit;
  return this.claimsService.findAll(role, userId, skip, limit);
}
```

Actualizar `claims.service.ts.findAll()` para aceptar `skip` y `take`.

**Para probar:**
```bash
curl "http://localhost:3000/api/objects?page=1&limit=5"
# Expected: solo 5 objetos + metadata de paginación (total, page, limit)
```

#### T11. GET /claims/my (NF3)
**Archivo:** `services/claims-service/src/infrastructure/controllers/claims.controller.ts`

```ts
@Get('my')
async getMyClaims(
  @Headers('x-user-id') userId: string,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
) {
  const skip = (page - 1) * limit;
  return this.claimsService.findByUser(userId, skip, limit);
}
```

Agregar `findByUser()` en `claims.service.ts`:
```ts
async findByUser(userId: string, skip: number, take: number) {
  return this.prisma.claim.findMany({
    where: { userId },
    skip,
    take,
    include: { object: true, evidences: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

**Para probar:**
```bash
curl -H "x-user-id: student-001" -H "x-user-role: STUDENT" \
  "http://localhost:3000/api/claims/my?page=1&limit=10"
# Expected: solo claims del usuario student-001
```

#### T12. GitHub Actions CI (NF7)
**Crear:** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main, test, 'feature/**']
  pull_request:
    branches: [main, test]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
    defaults:
      run:
        working-directory: services/claims-service
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma generate
      - run: npm run test -- --passWithNoTests
      - run: npm run build
```

**Para probar:** Push a GitHub → Actions tab → verificar que el workflow corre.

### Do NOT
- No toques `schema.prisma` sin coordinar con P1 (pasa tus requisitos de índices)
- No toques handlers ni factories (son de P2)
- No modifiques `main.ts` de claims-service para Swagger (es de P2)

### Criterios de éxito
- [ ] Seed: admin user + objetos todas categorías + claims 3 estados
- [ ] Outbox: sin race conditions, eventos PROCESSING con timeout
- [ ] Objects CRUD: POST/PATCH/DELETE funcionan
- [ ] Paginación: page + limit en claims y objects
- [ ] GET /claims/my retorna claims del usuario autenticado
- [ ] CI/CD: workflow de GitHub Actions pasa
- [ ] Health check audit-service apunta a /health

### Deliverables
Commit con mensaje: `feat(backend): outbox, seed, objects CRUD, pagination, claims/my, CI`

---

## Persona 4 — Frontend Base: Setup, Design System, UI, Layouts, Auth Pages

### Misión
Eres el encargado de crear el proyecto frontend desde cero. Implementas el design system, todos los componentes UI reutilizables, layouts, routing, stores, API client, y las páginas de autenticación (Login, Register, 404, Unauthorized). **Sin tus componentes, P5 no puede trabajar. Pero P5 arranca con mocks mientras tanto.**

### Archivos que debes leer primero
1. `frontend/STACK.md` — tecnologías, patrones, instalación
2. `frontend/design.md` — tokens de diseño, componentes, colores, radios, tipografía
3. `frontend/FRONTEND_MISSING_FEATURES.md` — lecciones aprendidas, features a implementar
4. `frontend/views/LoginPage.md`, `frontend/views/RegisterPage.md`, `frontend/views/NotFoundPage.md`, `frontend/views/UnauthorizedPage.md`

### Tareas

#### T1. Setup del proyecto
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install sonner lucide-react date-fns
npm install clsx tailwind-merge
```

**Importante:** El proyecto se crea en `frontend/` que ya existe (tiene design.md y FRONTEND_MISSING_FEATURES.md). Instala Vite en un directorio temporal y mueve los archivos, o usa `--template` apuntando a la carpeta correcta.

Configurar `vite.config.ts` con alias `@` apuntando a `src/`.

**Para probar:**
```bash
npm run dev  # debe levantar el servidor sin errores
npm run build  # debe compilar sin errores
```

#### T2. Tailwind config con tokens de diseño
**Archivo:** `tailwind.config.ts`

Mapear todos los tokens del `frontend/design.md` a Tailwind:
- Colores: brand (black, near-black, green, navy, blue, coral), status (pending, approved, rejected), surface (stone, green-wash, blue-wash), ink, muted
- Border radius: xs (4px), sm (8px), md (12px), lg (16px), xl (20px), pill (24px)
- Font families: display (Space Grotesk), body (Inter), mono (JetBrains Mono)
- Breakpoints del design.md

En `index.css`, definir las variables CSS custom como fallback.

**Para probar:**
```bash
# Verificar que las clases de Tailwind funcionan
# <div className="bg-brand-green text-white rounded-lg"> debería verse verde oscuro con borde redondeado
```

#### T3. Inicializar shadcn/ui + componentes base
```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog input select label textarea
npx shadcn@latest add table badge skeleton tabs sheet separator
npx shadcn@latest add dropdown-menu avatar progress
```

Personalizar cada componente para que use los tokens de diseño (colores brand, radios personalizados).

**Para probar:**
```bash
# Verificar que los componentes se renderizan
# <Button variant="default">Test</Button> debe ser near-black pill
# <Badge>PENDING</Badge> debe ser ámbar
```

#### T4. Componentes UI personalizados
Crear en `src/components/ui/`:

| Componente | Props | Comportamiento |
|-----------|-------|---------------|
| `EmptyState.tsx` | `icon: LucideIcon`, `title: string`, `description?: string`, `action?: { label, onClick }` | Icono + título + descripción + CTA opcional |
| `ErrorState.tsx` | `message: string`, `onRetry?: () => void` | Icono de error + mensaje + botón "Reintentar" |
| `Spinner.tsx` | `size?: 'sm' \| 'md' \| 'lg'` | SVG spinner animado |
| `LoadingButton.tsx` | Extiende Button + `isLoading: boolean` | Button con spinner + disabled mientras carga |
| `SearchField.tsx` | `value, onChange, placeholder, onClear` | Input con lupa + botón de limpiar |
| `Pagination.tsx` | `page, totalPages, onChange` | Anterior/1/2/3/.../N/Siguiente |
| `ConfirmModal.tsx` | `open, onConfirm, onCancel, title, description, confirmLabel, variant` | Modal de confirmación con variants (danger, warning) |
| `Modal.tsx` | `open, onClose, title, children, size?` | Overlay + focus trap + Escape + click outside + animación fade |
| `Toaster.tsx` | Wrapper de Sonner | Posicionamiento top-right |
| `StatusBadge.tsx` | `status: ClaimStatus` | PENDING → ámbar, APPROVED → verde, REJECTED → rojo |

**Para probar:**
```bash
# Renderizar cada componente en una página de prueba
# EmptyState: debe centrar icono + texto + CTA
# ErrorState: debe mostrar mensaje + botón Retry clickeable
# ConfirmModal: debe abrir/cerrar con Escape y click outside
```

#### T5. API client
**Archivo:** `src/lib/api.ts`

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.message || 'Error del servidor');
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Objects
  getObjects: (params: ObjectQueryParams) =>
    request<PaginatedResponse<Object>>(`/objects?${buildQuery(params)}`),

  getObject: (id: string) =>
    request<Object>(`/objects/${id}`),

  createObject: (data: CreateObjectDto) =>
    request<Object>('/objects', { method: 'POST', body: JSON.stringify(data) }),

  updateObject: (id: string, data: UpdateObjectDto) =>
    request<Object>(`/objects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteObject: (id: string) =>
    request<void>(`/objects/${id}`, { method: 'DELETE' }),

  // Claims
  getClaims: (params: ClaimQueryParams) =>
    request<PaginatedResponse<Claim>>(`/claims?${buildQuery(params)}`),

  getMyClaims: (params: PaginationParams) =>
    request<PaginatedResponse<Claim>>(`/claims/my?${buildQuery(params)}`),

  getClaim: (id: string) =>
    request<ClaimDetail>(`/claims/${id}`),

  createClaim: (data: CreateClaimDto) =>
    request<Claim>('/claims', { method: 'POST', body: JSON.stringify(data) }),

  updateClaim: (id: string, data: UpdateClaimDto) =>
    request<Claim>(`/claims/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteClaim: (id: string) =>
    request<void>(`/claims/${id}`, { method: 'DELETE' }),

  verifyClaim: (id: string) =>
    request<VerificationResult>(`/claims/${id}/verify`, { method: 'POST' }),

  auditClaim: (id: string) =>
    request<AuditReport>(`/claims/${id}/audit`),
};
```

**Para probar:**
```bash
import { api } from '@/lib/api';
const objects = await api.getObjects({ page: 1, limit: 10 });
console.log(objects);
# Expected: datos del backend sin errores
```

#### T6. Stores (Zustand + TanStack Query)
**Archivo:** `src/stores/authStore.ts`

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrating: true,
      login: async (email, password) => {
        const { token, user } = await api.login(email, password);
        set({ token, user });
      },
      logout: () => {
        set({ user: null, token: null });
        window.location.href = '/';
      },
      setUser: (user) => set({ user }),
    }),
    { name: 'auth-storage', partialize: (state) => ({ token: state.token }) }
  )
);
```

En `main.tsx`, configurar TanStack Query:
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster />
  </QueryClientProvider>
);
```

**Para probar:**
```bash
# AuthStore: login() debe guardar token y user en localStorage
# TanStack Query: useQuery debe funcionar con api.getObjects
```

#### T7. Layouts
Crear en `src/components/layout/`:

**PublicLayout.tsx:**
```tsx
// Navbar: Logo | Catálogo | Cómo funciona | Iniciar sesión (si no autenticado)
// Footer: institucional con links a Bienestar Universitario
// <Outlet /> para contenido
```

**StudentLayout.tsx:**
```tsx
// Navbar: Logo | Catálogo | Mis Reclamaciones | UserMenu (avatar + nombre + cerrar sesión)
// Footer: mismo que PublicLayout
// <Outlet /> para contenido
```

**AdminLayout.tsx:**
```tsx
// TopBar: Logo + logout
// Sidebar (240px): Dashboard | Objetos | Reclamos | Auditoría
// <Outlet /> para contenido principal
// Sidebar colapsable en mobile (Sheet/drawer)
```

Usar Lucide para iconos de navbar y sidebar.

**Para probar:**
```bash
# PublicLayout: navbar con links, footer visible
# AdminLayout: sidebar con 4 items, activo resaltado
# StudentLayout: navbar con user menu, al hacer click en usuario se abre dropdown con cerrar sesión
```

#### T8. Routing con guards
**Archivo:** `src/App.tsx`

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { GuestOnlyRoute, StudentRoute, AdminRoute } from '@/components/routing/Guards';
import { CatalogPage } from '@/pages/CatalogPage';
// ... imports lazy

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'objects/:id', element: <ObjectDetailPage /> },
      { element: <GuestOnlyRoute />, children: [
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
      ]},
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <StudentLayout />,
    children: [
      { element: <StudentRoute />, children: [
        { path: 'mis-reclamaciones', element: <MyClaimsPage /> },
        { path: 'objects/:id/claim', element: <CreateClaimPage /> },
        { path: 'claims/:id', element: <ClaimDetailPage /> },
      ]},
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { element: <AdminRoute />, children: [
        { path: 'admin', element: <AdminDashboardPage /> },
        { path: 'admin/objects', element: <AdminObjectsListPage /> },
        { path: 'admin/objects/new', element: <AdminCreateObjectPage /> },
        { path: 'admin/objects/:id/edit', element: <AdminEditObjectPage /> },
        { path: 'admin/claims', element: <AdminClaimsListPage /> },
        { path: 'admin/claims/:id', element: <AdminClaimDetailPage /> },
        { path: 'admin/claims/:id/audit', element: <ClaimAuditPage /> },
        { path: 'admin/audit-log', element: <GlobalAuditLogPage /> },
      ]},
    ],
  },
  { path: 'unauthorized', element: <UnauthorizedPage /> },
]);
```

Guard components en `src/components/routing/Guards.tsx`:
- `GuestOnlyRoute`: si hay usuario, redirect a home rol-based
- `StudentRoute`: si no hay usuario → login; si role !== STUDENT → unauthorized
- `AdminRoute`: si no hay usuario → login; si role !== ADMIN → unauthorized

**Para probar:**
```bash
# Sin autenticar: /admin → redirect a /login
# Sin autenticar: /mis-reclamaciones → redirect a /login
# Como STUDENT: /admin → /unauthorized
# Como ADMIN: /mis-reclamaciones → /unauthorized
# /ruta-inexistente → NotFoundPage
```

#### T9. Hooks
**Archivo:** `src/hooks/useDebounce.ts`

```ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

**Archivo:** `src/hooks/useApi.ts` (hook genérico loading/error/data)

**Para probar:**
```bash
import { useDebounce } from '@/hooks/useDebounce';
// usarlo en un input de búsqueda
// Verificar que el valor se actualiza 300ms después de dejar de escribir
```

#### T10. Types y Enums
**Archivo:** `src/types/index.ts`

```ts
export enum Role { STUDENT = 'STUDENT', ADMIN = 'ADMIN' }
export enum ObjectCategory { ELECTRONIC = 'ELECTRONIC', CLOTHING = 'CLOTHING', STATIONERY = 'STATIONERY', DOCUMENT = 'DOCUMENT', ACCESSORY = 'ACCESSORY', OTHER = 'OTHER' }
export enum ClaimStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED' }
export enum EvidenceType { SERIAL_NUMBER = 'SERIAL_NUMBER', DIGITAL_INVOICE = 'DIGITAL_INVOICE', DETAILED_DESCRIPTION = 'DETAILED_DESCRIPTION', REFERENCE_PHOTO = 'REFERENCE_PHOTO', LOCATION_DETAIL = 'LOCATION_DETAIL' }

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LostObject {
  id: string;
  name: string;
  description: string;
  photo: string | null;
  category: ObjectCategory;
  location: string | null;
  foundAt: string;
  status: string;
}

export interface Claim {
  id: string;
  status: ClaimStatus;
  userId: string;
  objectId: string;
  rejectionReason?: string;
  createdAt: string;
  object: LostObject;
  evidences: Evidence[];
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  url?: string;
  description: string;
  claimId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

**Para probar:**
```bash
# Importar tipos en cualquier archivo → autocompletado funciona
# const obj: LostObject = { ... } → TypeScript valida campos requeridos
```

#### T11. Zod Schemas
**Crear:** `src/schemas/claim.schema.ts`, `src/schemas/object.schema.ts`, `src/schemas/auth.schema.ts`

```ts
// claim.schema.ts
import { z } from 'zod';

export const evidenceSchema = z.object({
  type: z.nativeEnum(EvidenceType),
  url: z.string().url().optional(),
  description: z.string().min(10, 'Mínimo 10 caracteres').max(500),
});

export const createClaimSchema = z.object({
  objectId: z.string().uuid(),
  evidences: z.array(evidenceSchema).min(1, 'Debe tener al menos 1 evidencia'),
});

export const rejectClaimSchema = z.object({
  rejectionReason: z.string().min(10, 'La razón debe tener al menos 10 caracteres').max(500),
});

export type CreateClaimFormData = z.infer<typeof createClaimSchema>;
```

**Para probar:**
```bash
const result = createClaimSchema.safeParse({ objectId: 'invalido', evidences: [] });
console.log(result.success); // false
console.log(result.error.issues); // errores descriptivos
```

#### T12. Auth Pages (Login, Register, NotFound, Unauthorized)
Lee los archivos `frontend/views/LoginPage.md`, `RegisterPage.md`, `NotFoundPage.md`, `UnauthorizedPage.md` para los detalles.

**LoginPage:**
- Formulario email + password con React Hook Form + Zod
- Loading state en botón
- Error inline para credenciales inválidas
- Redirect a returnUrl o home rol-based post-login
- Si ya hay sesión, redirect automático

**RegisterPage:**
- Formulario nombre + email + password + confirmar
- Validación con Zod (email formato, password match)
- Auto-login post-registro

**NotFoundPage:**
- EmptyState con variante 404
- Botón "Volver al inicio"

**UnauthorizedPage:**
- EmptyState con icono de candado
- Mensaje "No tienes permisos para acceder a esta sección"

**Para probar:**
```bash
# Login: email vacío → error de validación
# Login: credenciales inválidas → error del servidor
# Login: éxito → redirect
# 404: navegar a /ruta-inexistente
```

### Do NOT
- No implementes páginas que no sean de auth (CatalogPage, MyClaimsPage, etc. — son de P5)
- No modifiques `schema.prisma` ni código del backend
- No agregues dependencias sin actualizar este documento

### Criterios de éxito
- [ ] `npm run dev` levanta con hot-reload
- [ ] `npm run build` compila sin errores
- [ ] Tailwind tokens funcionan (colores brand, radios personalizados, fuentes)
- [ ] Componentes shadcn renderizan con los tokens correctos
- [ ] EmptyState, ErrorState, LoadingButton funcionan con sus props
- [ ] Modal abre/cierra con Escape, click outside, y tiene animación
- [ ] Layouts: 3 layouts distintos (Public, Student, Admin con sidebar)
- [ ] Guards: GuestOnly, Student, Admin redirigen correctamente
- [ ] Login: formulario funciona, guarda token en store, redirect
- [ ] TanStack Query: useQuery funciona
- [ ] AuthStore: persiste sesión en localStorage

### Deliverables
Commit con mensaje: `feat(frontend): project setup, design system, UI components, layouts, routing, auth pages`

---

## Persona 5 — Frontend Páginas: 13 vistas + E2E Tests

### Misión
Eres el encargado de implementar todas las páginas del estudiante y del admin. **Arrancas desde el día 1 con datos mockeados.** Cuando P4 entregue los componentes UI y layouts, migras a usarlos. Cuando P3 entregue los endpoints reales, cambias de mocks a API real. **Estrategia: mock first, real después.**

### Archivos que debes leer primero
1. `frontend/STACK.md` — patrones de código, estructura de archivos
2. `frontend/design.md` — tokens de diseño, componentes disponibles
3. `frontend/FRONTEND_MISSING_FEATURES.md` — lecciones (L1-L10: errores a no repetir)
4. `frontend/views/` — **todos los archivos** (cada view tiene su propio .md con especificación completa)
5. `PLAN_TRABAJO_5_PERSONAS.md` — tu rol, dependencias, estrategia de mocks

### Regla de oro: Mock first, real después

```tsx
// Mientras no exista el endpoint real, usa datos mockeados
const MOCK_OBJECTS: LostObject[] = [
  { id: 'obj-1', name: 'Laptop HP', category: ObjectCategory.ELECTRONIC, photo: 'https://...', description: '...', location: 'Biblioteca', foundAt: '2026-05-20', status: 'AVAILABLE' },
  { id: 'obj-2', name: 'Chaqueta Azul', category: ObjectCategory.CLOTHING, photo: null, description: '...', location: 'Cafetería', foundAt: '2026-05-19', status: 'AVAILABLE' },
  // ... mínimo 6 objetos mockeados
];

const API_READY = false;  // ← cambiar a true cuando el backend esté listo

export function CatalogPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['objects'],
    queryFn: () => API_READY ? api.getObjects({}) : Promise.resolve({ data: MOCK_OBJECTS, total: MOCK_OBJECTS.length, page: 1, limit: 20 }),
  });
  // ... mismo código para ambos casos
}
```

Cuando el backend esté listo, solo cambias `API_READY = true` y todo funciona.

### Tareas

#### T1. CatalogPage
**Lee:** `frontend/views/CatalogPage.md`

Componentes a crear:
- `ObjectCard` — foto (placeholder SVG si no hay), nombre, categoría (coral chip), fecha, ubicación
- `CategoryFilterChips` — chips para cada categoría, active state

Estados: loading (skeleton 6 cards), empty ("No hay objetos"), error (retry), success

**API:** `GET /objects?page=&limit=&category=&q=`

**Mock:** 6 objetos de distintas categorías, 1 sin foto

**Para probar:**
```bash
# Carga inicial: ver skeleton cards
# Datos cargados: ver grid de tarjetas
# Búsqueda: escribir en search → debounce 300ms → filtrar
# Categoría: click en chip → filtrar
# Sin resultados: ver EmptyState "No se encontraron objetos"
```

#### T2. ObjectDetailPage
**Lee:** `frontend/views/ObjectDetailPage.md`

Componentes a crear:
- `ObjectHero` — foto grande (radio 16px) + overlay gradient (sutil)
- `LocationDetail` — ubicación con icono de mapa
- `ClaimCTAButton` — visible solo si STUDENT + AVAILABLE

**API:** `GET /objects/:id`

**Mock:** objeto con foto, objeto sin foto (placeholder), objeto CLAIMED

**Para probar:**
```bash
# Objeto con foto: ver foto grande
# Objeto sin foto: ver placeholder SVG
# Objeto AVAILABLE + STUDENT: ver botón "Reclamar"
# Objeto CLAIMED: ver badge "Ya reclamado"
# Sin autenticar: ver "Inicia sesión para reclamar"
```

#### T3. CreateClaimPage
**Lee:** `frontend/views/CreateClaimPage.md`

Componentes a crear:
- `ClaimForm` — formulario con React Hook Form + Zod
- `EvidenceBuilder` — agregar/quitar filas de evidencia
- `EvidenceTypeSelect` — dropdown con EvidenceTypes del enum
- `ObjectMiniCard` — foto pequeña + nombre del objeto

**API:** `GET /objects/:id` (contexto), `POST /claims`

**Mock:** objeto precargado, submit falso con toast success

**Para probar:**
```bash
# Sin evidencias: botón submit deshabilitado
# 1 evidencia: botón habilitado
# 5 evidencias: botón "Agregar" deshabilitado (límite)
# Submit exitoso: toast + redirect a /mis-reclamaciones
# Submit error: toast error + formulario sigue abierto
```

#### T4. MyClaimsPage
**Lee:** `frontend/views/MyClaimsPage.md`

Componentes a crear:
- `ClaimCard` — foto objeto, nombre, fecha, status badge, razón si REJECTED
- `ClaimStatusBadge` — PENDING (ámbar), APPROVED (verde), REJECTED (rojo)

**API:** `GET /claims/my?page=&limit=`

**Mock:** 3 claims en distintos estados (1 PENDING, 1 APPROVED, 1 REJECTED con razón)

**Para probar:**
```bash
# Lista: ver claims con badges de estado
# PENDING: badge ámbar + "En espera de revisión"
# APPROVED: badge verde + "Puedes recoger en Bienestar"
# REJECTED: badge rojo + razón visible
# Sin claims: EmptyState "No has realizado reclamos" + CTA a catálogo
```

#### T5. ClaimDetailPage (student)
**Lee:** `frontend/views/ClaimDetailPage.md`

Componentes a crear:
- `Timeline` — línea de tiempo: Creado → En revisión → Aprobado/Rechazado
- `EvidenceList` — lista de evidencias con tipo + descripción
- `RejectionBanner` — banner rojo (solo REJECTED)
- `ApprovalBanner` — banner verde (solo APPROVED)

**API:** `GET /claims/:id`

**Mock:** claim con 2 evidencias, claim rechazado con razón

**Para probar:**
```bash
# Claim PENDING: timeline muestra paso 1 y 2 activos
# Claim APPROVED: timeline completo + banner verde
# Claim REJECTED: timeline detenido + banner rojo con razón
# Evidencias: lista con tipo y descripción
```

#### T6. AdminDashboardPage
**Lee:** `frontend/views/AdminDashboardPage.md`

Componentes a crear:
- `StatsCard` — número grande + label + icono (×5)
- `ActivityFeed` — lista de acciones recientes con timestamp relativo
- `QuickActionCard` — icono + texto + link

**API:** `GET /admin/stats`, `GET /admin/recent-activity`

**Mock:** stats (15 total, 8 pending, 4 approved, 3 rejected, 20 objects), actividad reciente

**Para probar:**
```bash
# Stats: 5 cards con números correctos
# Click en stats card: filtra por estado
# Activity: lista de últimas 10 acciones
# Quick actions: 3 cards con links funcionales
```

#### T7. AdminObjectsListPage
**Lee:** `frontend/views/AdminObjectsListPage.md`

Componentes a crear:
- `ObjectsTable` — tabla: foto thumb, nombre, categoría, fecha, estado, acciones (editar/eliminar)

**API:** `GET /objects`, `DELETE /objects/:id`

**Mock:** 5 objetos de distintas categorías

**Para probar:**
```bash
# Lista: tabla con objetos
# Eliminar: ConfirmModal → confirmar → toast success → tabla actualizada
# Buscar: filtro por nombre
# Sin resultados: EmptyState
```

#### T8. AdminCreateObjectPage
**Lee:** `frontend/views/AdminCreateObjectPage.md`

Componentes a crear:
- `ObjectForm` — formulario con React Hook Form + Zod
- `ImageUploader` — drag & drop + preview + eliminar

**API:** `POST /objects`

**Mock:** submit con toast success + redirect a lista

**Para probar:**
```bash
# Formulario vacío: botón deshabilitado
# Todos los campos llenos: botón habilitado
# Subir foto: preview visible
# Submit exitoso: toast + redirect
```

#### T9. AdminEditObjectPage
**Lee:** `frontend/views/AdminEditObjectPage.md`

Reutiliza `ObjectForm` de AdminCreateObjectPage pero pre-cargado con datos existentes. Agrega `StatusSelect` para cambiar estado.

**API:** `GET /objects/:id`, `PATCH /objects/:id`

**Mock:** objeto precargado en el formulario

**Para probar:**
```bash
# Formulario precargado con datos del objeto
# Cambiar estado a DONATED: ConfirmModal de advertencia
# Guardar: toast success + redirect
```

#### T10. AdminClaimsListPage
**Lee:** `frontend/views/AdminClaimsListPage.md`

Componentes a crear:
- `ClaimsTable` — tabla densa: foto thumb, estudiante, objeto, fecha, status, acciones
- `DateRangePicker` — selector de fechas con presets

**API:** `GET /claims?page=&limit=&status=&dateFrom=&dateTo=`

**Mock:** 8 claims en distintos estados

**Para probar:**
```bash
# Tabla: todas las columnas visibles
# Filtro status: solo PENDING, solo APPROVED, solo REJECTED
# Filtro fechas: selector de rango
# Click en fila: navega a /admin/claims/:id
# Pending destacados: aparecen primero o con badge más visible
```

#### T11. AdminClaimDetailPage
**Lee:** `frontend/views/AdminClaimDetailPage.md`

Componentes a crear:
- `EvidenceReviewer` — panel de evidencias del estudiante
- `CoRResultPanel` — resultado de la verificación (qué handler falló, por qué)
- `VerifyButton` — botón que ejecuta la verificación
- `ApproveButton` — botón verde con confirmación
- `RejectButton` — botón rojo con modal de razón

**API:** `GET /claims/:id`, `POST /claims/:id/verify`, `PATCH /claims/:id`

**Mock:** claim con 2 evidencias, verificación simulada

**Para probar:**
```bash
# Layout 2 columnas: izq (objeto + evidencias), der (acciones)
# Click "Verificar": ejecuta CoR → muestra resultado
# CoR éxito: botón Aprobar habilitado
# CoR fallo: botón Rechazar pre-llenado con razón
# Aprobar: ConfirmModal → OK → toast + status badge actualizado
# Rechazar: ConfirmModal con campo razón obligatorio → OK → toast
```

#### T12. ClaimAuditPage
**Lee:** `frontend/views/ClaimAuditPage.md`

Componentes a crear:
- `SimilarityScoreCard` — score grande + barra de progreso
- `JaccardBar` — barras horizontales por tipo de evidencia
- `EvidenceComparisonTable` — tabla comparativa
- `IntegrityBadge` — badge verde/rojo de cadena de hash

**API:** `GET /claims/:id/audit`

**Mock:** audit report con scores simulados

**Para probar:**
```bash
# Score global: número + barra de progreso
# Barras Jaccard: cada evidence type con su score
# Integrity badge: verde "Cadena intacta"
```

#### T13. GlobalAuditLogPage
**Lee:** `frontend/views/GlobalAuditLogPage.md`

Componentes a crear:
- `AuditLogTable` — tabla: timestamp, actor, acción, entidad, hash
- `IntegrityChecker` — botón + banner de resultado
- `ActionFilter` — dropdown por tipo de acción

**API:** `GET /audit-log`, `GET /audit-log/verify-integrity`

**Mock:** 10 entradas de audit log

**Para probar:**
```bash
# Tabla: todas las columnas con datos
# Hash truncado: tooltip con hash completo al hover
# Click "Verificar integridad": spinner → banner verde/rojo
# Filtro por acción: dropdown filta correctamente
```

#### T14. Integration tests (E2E)
Crear tests para el flujo crítico:

```ts
// Flujo completo: estudiante crea claim → admin verifica → admin aprueba
describe('Claim Lifecycle E2E', () => {
  it('should complete full claim lifecycle', async () => {
    // 1. Login como estudiante
    // 2. Ver catálogo de objetos
    // 3. Ver detalle de objeto
    // 4. Crear claim con evidencias
    // 5. Ver claim en Mis Reclamaciones
    // 6. Login como admin
    // 7. Ver claim en lista de admin
    // 8. Ejecutar verificación
    // 9. Aprobar claim
    // 10. Verificar status actualizado
  });

  it('should reject claim with insufficient evidence', async () => {
    // 1-4. Crear claim con evidencia inválida
    // 5-8. Admin verifica → falla → rechaza con razón
    // 9. Estudiante ve razón de rechazo
  });
});
```

**Para probar:**
```bash
npx vitest run --reporter=verbose
# Expected: todos los tests pasan
```

### Do NOT
- No modifiques el design system ni los componentes UI sin coordinar con P4
- No implementes fixes del backend (son de P1/P2/P3)
- No uses `alert()` (L4) — usa el Toaster de Sonner
- No hagas optimistic updates en catch (L2) — solo actualiza en éxito
- No hardcodees userIds (L1) — usa AuthStore
- No dejes `console.error` sin feedback (L3) — usa ErrorState
- No uses strings en vez de enums (L7) — importa los tipos

### Criterios de éxito
- [ ] CatalogPage: grid + búsqueda + filtros + paginación
- [ ] ObjectDetailPage: foto + metadata + CTA condicional
- [ ] CreateClaimPage: formulario con evidencias + validación
- [ ] MyClaimsPage: lista con estados + razones
- [ ] ClaimDetailPage: timeline + evidencias + banners
- [ ] AdminDashboardPage: stats + actividad + quick actions
- [ ] Admin CRUD objects: listar + crear + editar + eliminar
- [ ] AdminClaimsListPage: tabla + filtros (status, fecha)
- [ ] AdminClaimDetailPage: CoR + approve/reject con confirmación
- [ ] ClaimAuditPage: scores Jaccard + integridad
- [ ] GlobalAuditLogPage: tabla + integrity check
- [ ] E2E tests: flujo completo estudiante → admin
- [ ] Sin console.error sin feedback, sin alert(), sin strings en vez de enums

### Deliverables
Commit con mensaje: `feat(frontend): all pages, admin panel, claim lifecycle, e2e tests`
