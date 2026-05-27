# Backend Fixes — Plan de Arreglos

> **Proyecto:** Lost & Found Uninorte
> **Branch:** `entrega-final`
> **Propósito:** Documentar todos los arreglos necesarios en el backend (claims-service + audit-service) para tener una base sólida antes de reconstruir el frontend desde cero.

---

## Fase 1 — Correcciones Críticas (Hacer ya, antes que nada)

Estos issues rompen funcionalidad core y deben corregirse antes de cualquier otra cosa.

### 1.1 Agregar `ValidationPipe` global

**Servicios:** claims-service + audit-service

```ts
// services/claims-service/src/infrastructure/main.ts
// services/audit-service/src/main.ts

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

**Archivos a modificar:**
- `services/claims-service/src/infrastructure/main.ts` — agregar después de `app.setGlobalPrefix('api')`
- `services/audit-service/src/main.ts` — agregar después de crear el `app`

**Verificación:**
- Enviar POST `/claims` con body vacío → debe responder 400, no 201
- Enviar POST `/claims` con `status: 'INVALIDO'` → debe responder 400

---

### 1.2 Corregir mismatch Prisma Schema / ACL

**Problema:** El modelo `Object` en Prisma no tiene campos `name` ni `status`, pero el ACL (`ClaimResponseDto`) los referencia.

**Archivos a modificar:**
- `services/claims-service/prisma/schema.prisma` — agregar al modelo `Object`:
  ```prisma
  name        String   // nombre descriptivo del objeto
  status      String   @default("AVAILABLE") // AVAILABLE | CLAIMED | DONATED
  ```
- Crear migración: `npx prisma migrate dev --name add_object_name_status`
- `services/claims-service/prisma/seed.cjs` — agregar `name` y `status` a objetos del seed

**Dependencias:** Seed data (1.4)

---

### 1.3 Eliminar doble emisión de auditoría

**Problema:** El interceptor `audit-log.interceptor.ts` emite directo a RabbitMQ Y el `ClaimsService` encola eventos via Outbox. Producen 2 eventos idénticos.

**Solución:** Centralizar todo en el Outbox Pattern (es transaccional).

**Archivos a modificar:**
- `services/claims-service/src/application/interceptors/audit-log.interceptor.ts`:
  - Eliminar `this.client.emit('audit.event.created', eventData)` (línea 91)
  - Opcional: mantener el interceptor pero solo para capturar metadatos (IP, user-agent, timestamp) y delegar al outbox
- `services/claims-service/src/application/services/claims.service.ts`:
  - El outbox ya está implementado via `outboxService.enqueueAuditEvent()`
  - Verificar que todos los métodos llamen a `enqueueAuditEvent()` (create, update, remove, verify)

**Verificación:**
- Crear un claim
- Revisar tabla `OutboxEvent` — debe haber 1 evento PENDING
- Revisar cola RabbitMQ — debe llegar 1 mensaje
- Revisar tabla `AuditLog` en audit-db — debe haber 1 entrada

---

### 1.4 Expandir seed data

**Archivo:** `services/claims-service/prisma/seed.cjs`

**Lo que debe incluir:**

```js
// Usuarios
const admin = await prisma.user.create({
  data: {
    id: 'admin-001',
    email: 'admin@uninorte.edu.co',
    name: 'Admin Bienestar',
    role: 'ADMIN',
    password: 'hashed_password',
  },
});

const student = await prisma.user.create({
  data: {
    id: 'student-001',
    email: 'student@uninorte.edu.co',
    name: 'Carlos Méndez',
    role: 'STUDENT',
    password: 'hashed_password',
  },
});

// Objetos — mínimo 6, uno por categoría, incluyendo uno sin foto para probar regla crítica
const objects = [
  { category: 'ELECTRONIC',  name: 'Laptop HP',       description: 'Laptop HP Pavilion ...',   photo: 'https://...' },
  { category: 'ELECTRONIC',  name: 'Cargador USB',     description: 'Cargador USB-C 65W ...',   photo: null },  // ← Sin foto
  { category: 'CLOTHING',    name: 'Chaqueta Azul',    description: 'Chaqueta deportiva ...',    photo: 'https://...' },
  { category: 'STATIONERY',  name: 'Calculadora',      description: 'Calculadora científica ...', photo: 'https://...' },
  { category: 'DOCUMENT',    name: 'Carné Estudiantil', description: 'Carné #200123456 ...',     photo: 'https://...' },
  { category: 'ACCESSORY',   name: 'Gafas de Sol',     description: 'Gafas Ray-Ban ...',         photo: 'https://...' },
  { category: 'OTHER',       name: 'Termo Yeti',       description: 'Termo Yeti 1L ...',         photo: 'https://...' },
];

// Claims — al menos uno en cada estado
const pendingClaim = await prisma.claim.create({
  data: {
    status: 'PENDING',
    userId: student.id,
    objectId: objects[0].id,
    evidences: {
      create: [
        { type: 'SERIAL_NUMBER', url: 'https://...', description: 'Número de serie impreso en la base' },
        { type: 'REFERENCE_PHOTO', url: 'https://...', description: 'Foto del sticker con serial' },
      ],
    },
  },
});
```

**Además:**
- Crear `services/audit-service/prisma/seed.ts` con al menos 3 entradas de audit log encadenadas con hashes
- Eliminar `services/claims-service/prisma/seed.ts` (el .cjs es el que se usa)

---

### 1.5 Agregar ownership checks en update/delete

**Archivo:** `services/claims-service/src/application/services/claims.service.ts`

**Cambios:**
```ts
async update(id: string, dto: UpdateClaimDto, actorId: string): Promise<Claim> {
  const claim = await this.findClaimOrThrow(id);

  // Ownership check
  if (claim.userId !== actorId) {
    throw new ForbiddenException('No puedes modificar un reclamo que no te pertenece');
  }

  // Status check
  if (claim.status !== ClaimStatus.PENDING) {
    throw new BadRequestException('Solo se pueden modificar reclamos pendientes');
  }

  // ... resto de la lógica
}
```

Mismo patrón para `remove()`.

**Archivo:** `services/claims-service/src/infrastructure/controllers/claims.controller.ts`

- En `create()`, validar que `userId` del body coincide con `x-user-id` del header
- Validar también en el `ClaimsServiceProxy`

---

## Fase 2 — Completar Funcionalidad Backend

### 2.1 Completar Objects CRUD

**Archivo:** `services/claims-service/src/infrastructure/objects/objects.controller.ts`

Endpoints a agregar:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST`   | `/objects`          | Crear objeto perdido/encontrado | ADMIN |
| `PATCH`  | `/objects/:id`      | Actualizar objeto                | ADMIN |
| `DELETE` | `/objects/:id`      | Eliminar objeto                  | ADMIN |
| `GET`    | `/objects?category=&location=&q=` | Búsqueda con filtros | Público |

**Archivo:** `services/claims-service/src/infrastructure/objects/objects.service.ts`

Implementar lógica:
```ts
async create(dto: CreateObjectDto): Promise<Object> { ... }
async update(id: string, dto: UpdateObjectDto): Promise<Object> { ... }
async delete(id: string): Promise<void> { ... }
async search(params: ObjectSearchParams): Promise<Object[]> { ... }
```

DTOs necesarios:
- `services/claims-service/src/application/dto/create-object.dto.ts`
- `services/claims-service/src/application/dto/update-object.dto.ts`
- `services/claims-service/src/application/dto/object-search-params.dto.ts`

---

### 2.2 Agregar validación de evidencias (enum + mínimo)

**Archivo:** `services/claims-service/src/application/dto/create-claim.dto.ts`

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
  @IsNotEmpty()
  type: EvidenceType;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateClaimDto {
  @IsUUID()
  @IsNotEmpty()
  objectId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => EvidenceDto)
  evidences: EvidenceDto[];
}
```

**Sincronizar** `EvidenceMatchHandler` para que use el mismo enum y acepte `DIGITAL_INVOICE` para electrónicos.

---

### 2.3 Agregar índices a la base de datos

**Archivo:** `services/claims-service/prisma/schema.prisma`

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
  @@index([objectId, status])  // composite para AvailabilityHandler
  @@unique([userId, objectId])  // evitar claims duplicados
}

model Evidence {
  // ... campos existentes ...
  @@index([claimId])
}
```

Crear migración: `npx prisma migrate dev --name add_indexes_and_constraints`

---

### 2.4 Agregar paginación

**Archivos:**
- `services/claims-service/src/infrastructure/controllers/claims.controller.ts`
- `services/claims-service/src/infrastructure/objects/objects.controller.ts`

```ts
// Query params
@Get()
async findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
  @Headers('x-user-role') role: string,
  @Headers('x-user-id') userId: string,
) {
  return this.claimsService.findAll(role, userId, page, limit);
}
```

```ts
// En el service
async findAll(role: string, userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  return this.prisma.claim.findMany({
    skip,
    take: limit,
    where: role === 'ADMIN' ? {} : { userId },
    include: { object: true, evidences: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

---

### 2.5 Agregar endpoint `GET /claims/my` para estudiantes

**Archivo:** `services/claims-service/src/infrastructure/controllers/claims.controller.ts`

```ts
@Get('my')
@UseGuards(RoleGuard)  // solo STUDENT
async getMyClaims(
  @Headers('x-user-id') userId: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return this.claimsService.findByUser(userId, page, limit);
}
```

---

### 2.6 Agregar `rejectionReason` a `UpdateClaimDto`

**Archivo:** `services/claims-service/src/application/dto/update-claim.dto.ts`

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

## Fase 3 — Outbox Pattern & Mensajería

### 3.1 Fix race condition en Outbox

**Archivo:** `services/claims-service/src/application/services/outbox.service.ts`

Reemplazar `reserveBatch()` con una query raw que use `FOR UPDATE SKIP LOCKED`:

```ts
async reserveBatch(batchSize: number = 10): Promise<OutboxEvent[]> {
  const result = await this.prisma.$queryRaw<OutboxEvent[]>`
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
  return result;
}
```

### 3.2 Timeout para eventos PROCESSING huérfanos

(Incluido en el query de 3.1 — la condición `OR (status = 'PROCESSING' AND nextAttemptAt < NOW() - INTERVAL '5 minutes')` ya lo cubre.)

---

## Fase 4 — Infraestructura y Calidad

### 4.1 Agregar Swagger / OpenAPI

**Dependencia:**
```bash
npm install @nestjs/swagger
```

**Archivo:** `services/claims-service/src/infrastructure/main.ts`

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Lost & Found Uninorte — Claims Service')
  .setDescription('API de gestión de reclamos de objetos perdidos')
  .setVersion('1.0')
  .addApiKey({ type: 'apiKey', name: 'x-user-role', in: 'header' }, 'x-user-role')
  .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'x-user-id')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Decorar controladores:**
```ts
@ApiTags('Claims')
@Controller('claims')
export class ClaimsController {
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo reclamo' })
  @ApiBody({ type: CreateClaimDto })
  @ApiResponse({ status: 201, description: 'Reclamo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() dto: CreateClaimDto) { ... }
}
```

Mismo patrón para audit-service.

---

### 4.2 Agregar health endpoint en audit-service

**Archivo:** `services/audit-service/src/app.controller.ts` (o crear endpoint dedicado)

```ts
@Get('health')
health() {
  return {
    status: 'ok',
    service: 'audit-service',
    timestamp: new Date().toISOString(),
    db: await this.prismaService.$queryRaw`SELECT 1`,
  };
}
```

Actualizar `docker-compose.yml` health check del audit-service para usar `/health`.

---

### 4.3 Agregar exception filter global

**Archivo:** `services/claims-service/src/infrastructure/common/filters/`

Crear un filter global que maneje:
- `NotFoundException` → 404
- `BadRequestException` → 400
- `ForbiddenException` → 403
- Prisma `P2002` (unique constraint) → 409 con mensaje claro
- Prisma `P2025` (record not found) → 404
- Cualquier otro error → 500 con mensaje genérico (sin leak de internals)

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

Registrar globalmente en `main.ts`:
```ts
app.useGlobalFilters(new GlobalExceptionFilter());
```

---

### 4.4 Sincronizar EvidenceMatchHandler con los tipos de evidencia

**Archivo:** `services/claims-service/src/application/handlers/evidence-match.handler.ts`

```ts
// Usar el enum centralizado
const VALID_EVIDENCE_TYPES = [
  EvidenceType.SERIAL_NUMBER,
  EvidenceType.DIGITAL_INVOICE,
  // ... más según categoría
];

async handle(context: ClaimVerificationContext): Promise<void> {
  const hasValidEvidence = context.claim.evidences.some(
    e => VALID_EVIDENCE_TYPES.includes(e.type as EvidenceType)
  );

  if (!hasValidEvidence) {
    throw new ClaimVerificationException(
      'No se encontró evidencia que coincida con el tipo de objeto'
    );
  }
}
```

---

## Fase 5 — Tests

### 5.1 Tests unitarios mínimos para MVP

| Archivo | Qué testear |
|---------|-------------|
| `handlers/identity.handler.ts` | Usuario existe vs no existe |
| `handlers/availability.handler.ts` | Objeto disponible vs ya reclamado |
| `handlers/evidence-match.handler.ts` | Evidencia válida vs inválida |
| `factories/electronic-claim.factory.ts` | Validación con/sin serial, con/sin factura |
| `factories/common-claim.factory.ts` | Validación con/sin descripción detallada |
| `visitors/audit.visitor.ts` | Generación de reporte de auditoría |
| `visitors/text-similarity.visitor.ts` | Cálculo de similitud Jaccard |
| `acl/anti-corruption-layer.service.ts` | Ya tiene tests, expandir cobertura |
| `outbox.service.ts` | Reserve, markPublished, markFailed |
| `claims.service.ts` | CRUD + verificación + errores esperados |

### 5.2 Tests de integración para flujo crítico

```ts
// Flujo: Crear claim → Verificar → Aprobar
describe('Claim Lifecycle (E2E)', () => {
  it('should create, verify and approve a claim', async () => { ... });
  it('should reject a claim with insufficient evidence', async () => { ... });
  it('should not allow student to approve their own claim', async () => { ... });
});
```

---

## Resumen de Archivos a Modificar/Crear

### Modificar
| Archivo | Cambio |
|---------|--------|
| `services/claims-service/src/infrastructure/main.ts` | ValidationPipe + Swagger + GlobalFilters |
| `services/audit-service/src/main.ts` | ValidationPipe + Health endpoint |
| `services/claims-service/src/infrastructure/controllers/claims.controller.ts` | Ownership checks, GET /claims/my, pagination |
| `services/claims-service/src/infrastructure/controllers/claims.service.proxy.ts` | Ownership validation |
| `services/claims-service/src/application/services/claims.service.ts` | Ownership checks, pagination |
| `services/claims-service/src/application/services/outbox.service.ts` | FOR UPDATE SKIP LOCKED, PROCESSING timeout |
| `services/claims-service/src/application/dto/create-claim.dto.ts` | EvidenceType enum, @ArrayMinSize |
| `services/claims-service/src/application/dto/update-claim.dto.ts` | Agregar rejectionReason |
| `services/claims-service/src/application/handlers/evidence-match.handler.ts` | Sincronizar con enum, aceptar DIGITAL_INVOICE |
| `services/claims-service/src/application/interceptors/audit-log.interceptor.ts` | Eliminar doble emisión |
| `services/claims-service/src/infrastructure/objects/objects.controller.ts` | CRUD completo + búsqueda |
| `services/claims-service/src/infrastructure/objects/objects.service.ts` | CRUD + búsqueda |
| `services/claims-service/prisma/schema.prisma` | name/status en Object, índices, unique constraint |
| `services/claims-service/prisma/seed.cjs` | Admin user, más objetos, claims, evidences |
| `docker-compose.yml` | Health check audit-service |

### Crear
| Archivo | Propósito |
|---------|-----------|
| `services/claims-service/src/application/dto/create-object.dto.ts` | DTO para crear objeto |
| `services/claims-service/src/application/dto/update-object.dto.ts` | DTO para actualizar objeto |
| `services/claims-service/src/application/dto/object-search-params.dto.ts` | DTO para búsqueda |
| `services/claims-service/src/infrastructure/common/filters/global-exception.filter.ts` | Exception filter global |
| `services/audit-service/prisma/seed.ts` | Seed para audit-service |

### Eliminar
| Archivo | Razón |
|---------|-------|
| `services/claims-service/prisma/seed.ts` | Duplicado de seed.cjs, no se usa |
| `frontend/` (directorio completo) | Se reconstruye desde cero |

---

## Checklist de Verificación Post-Arreglos

- [ ] `docker-compose up --build` levanta todos los servicios sin errores
- [ ] Seed data se carga correctamente (admin + student + objetos + claims)
- [ ] `GET /objects` devuelve objetos con `name` y `status`
- [ ] `POST /claims` con body válido crea un claim y evento outbox
- [ ] `POST /claims` con body inválido responde 400
- [ ] `GET /claims/:id/verify` ejecuta el Chain of Responsibility correctamente
- [ ] Audit log recibe 1 evento por acción (no duplicados)
- [ ] `GET /audit-log/verify-integrity` retorna `{ valid: true }`
- [ ] Estudiante no puede modificar/eliminar claims de otros
- [ ] Objeto sin foto es rechazado con 400 (regla crítica de negocio)
- [ ] Claims listos con paginación (page + limit params)
- [ ] Swagger UI accesible en `/api/docs`
- [ ] Tests unitarios pasan: `npm run test`
