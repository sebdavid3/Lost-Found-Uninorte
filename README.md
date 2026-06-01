# Lost & Found Uninorte

Sistema de gestión de objetos perdidos y reclamaciones para la Universidad del Norte.

---

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Inicio Rápido](#inicio-rápido)
- [Arquitectura](#arquitectura)
- [Servicios](#servicios)
- [API Endpoints](#api-endpoints)
- [Estructura de Datos](#estructura-de-datos)
- [Frontend](#frontend)
- [Autenticación](#autenticación)
- [Patrones de Diseño](#patrones-de-diseño)
- [Variables de Entorno](#variables-de-entorno)
- [Tests](#tests)
- [Solución de Problemas](#solución-de-problemas)

---

## Requisitos

- **Docker** y **Docker Compose** v2.x
- Node.js 20+ (solo para desarrollo local)

---

## Inicio Rápido

```bash
cp .env.example .env
docker compose up --build -d
```

Una vez levantado, accede al frontend en **http://localhost:5173**.

### Usuarios de prueba

| Email | Rol |
|---|---|
| `admin@uninorte.edu.co` | ADMIN |
| `carre@uninorte.edu.co` | STUDENT |
| `sebas@uninorte.edu.co` | STUDENT |

No hay contraseña — el sistema solo pide email y auto-registra usuarios nuevos. Si el email contiene "admin" se asigna rol ADMIN.

---

## Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│                    Lost & Found Uninorte                    │
├───────────────┬──────────────┬──────────────┬──────────────┤
│  user-service │object-service│claim-service │audit-service │
│   (port 3002) │  (port 3003) │  (port 3000) │  (port 3001) │
│   PostgreSQL  │  PostgreSQL  │  PostgreSQL  │  PostgreSQL  │
│   + Prisma    │  + Prisma    │  + Prisma    │  + Prisma    │
├───────────────┴──────────────┼──────────────┴──────────────┤
│       RabbitMQ (5672)        │   Consul (8500)             │
│    Outbox → Audit Events     │   Service Discovery         │
├──────────────────────────────┴─────────────────────────────┤
│               Frontend (React + Vite + Nginx)               │
│                      puerto 80 → host:5173                  │
└────────────────────────────────────────────────────────────┘
```

**4 microservicios** independientes, cada uno con su propia base de datos PostgreSQL. Comunicación síncrona vía HTTP y asíncrona vía RabbitMQ (patrón Outbox). Descubrimiento de servicios con Consul.

---

## Servicios

| Servicio | Contenedor | Puerto Interno | Puerto Host | Descripción |
|---|---|---|---|---|
| **user-service** | `lost_found_user_service` | 3002 | `USER_PUBLIC_PORT` (3002) | Gestión de usuarios por email |
| **object-service** | `lost_found_object_service` | 3003 | `OBJECT_PUBLIC_PORT` (3003) | CRUD de objetos perdidos |
| **claim-service** | `lost_found_claim_service` | 3000 | `CLAIMS_PUBLIC_PORT` (3000) | Reclamaciones, verificación, dashboard |
| **audit-service** | `lost_found_audit_service` | 3001 | `AUDIT_PUBLIC_PORT` (3001) | Auditoría inmutable con blockchain SHA-256 |
| **frontend** | `lost_found_frontend` | 80 | 5173 | React SPA servido con Nginx |
| **db** | `lost_found_db` | 5432 | `DB_PORT` (5432) | PostgreSQL compartido (user, object, claim) |
| **audit-db** | `lost_found_audit_db` | 5432 | `AUDIT_DB_PORT` (5433) | PostgreSQL de auditoría |
| **rabbitmq** | `lost_found_mq` | 5672 | `RABBITMQ_PORT` (5672) | Message broker AMQP |
| **consul** | `lost_found_consul` | 8500 | `CONSUL_PORT` (8500) | Service discovery |

### Puertos alternativos

Si tienes conflictos de puertos, edita `.env` en la raíz:

```env
CLAIMS_PUBLIC_PORT=3002
AUDIT_PUBLIC_PORT=3003
USER_PUBLIC_PORT=3004
OBJECT_PUBLIC_PORT=3005
```

El frontend se construye automáticamente con las URLs correctas (Docker build args).

---

## API Endpoints

### user-service (`/users`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/users/me?email=` | Buscar usuario por email (auto-crea si no existe) |
| `GET` | `/users/:id` | Buscar usuario por ID |
| `GET` | `/users` | Listar todos los usuarios |
| `GET` | `/health` | Health check |

### object-service (`/objects`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/objects?q=&category=&location=&page=&limit=` | — | Búsqueda paginada y filtrada |
| `GET` | `/objects/:id` | — | Ver objeto individual |
| `POST` | `/objects` | ADMIN | Crear objeto |
| `PATCH` | `/objects/:id` | ADMIN | Actualizar objeto |
| `DELETE` | `/objects/:id` | ADMIN | Eliminar objeto |
| `GET` | `/health` | — | Health check |

### claim-service (`/claims`)

Todas las rutas requieren headers `x-user-id` y `x-user-role`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/claims` | Any | Crear reclamación (con evidencias) |
| `GET` | `/claims?page=&limit=` | ADMIN=todos, STUDENT=propios | Listar reclamaciones |
| `GET` | `/claims/my` | Any | Mis reclamaciones |
| `GET` | `/claims/:id` | Owner o ADMIN | Ver reclamación |
| `PATCH` | `/claims/:id` | Owner o ADMIN | Actualizar (solo PENDING) |
| `DELETE` | `/claims/:id` | Owner o ADMIN | Eliminar (solo PENDING) |
| `POST` | `/claims/:id/verify` | ADMIN | Verificar (Chain of Responsibility) |
| `GET` | `/claims/:id/audit` | ADMIN | Auditoría de reclamación (Visitor) |
| `GET` | `/claims/filter/status?status=` | ADMIN | Filtrar por estado |
| `GET` | `/claims/filter/date-range?start=&end=` | ADMIN | Filtrar por fecha |
| `GET` | `/stats/dashboard` | — | Estadísticas del dashboard |
| `GET` | `/registry/:serviceName` | — | Service discovery (Consul) |
| `GET` | `/health` | — | Health check |

**Evidencias**: cada reclamación requiere evidencias según la categoría del objeto. Tipos válidos: `SERIAL_NUMBER`, `DIGITAL_INVOICE`, `DETAILED_DESCRIPTION`, `REFERENCE_PHOTO`, `LOCATION_DETAIL`.

### audit-service (`/audit-log`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/audit-log?page=&limit=` | Logs paginados |
| `GET` | `/audit-log/entity/:entityId` | Historial por entidad |
| `GET` | `/audit-log/actor/:actorId` | Acciones por actor |
| `GET` | `/audit-log/action/:action` | Filtrar por tipo de acción |
| `GET` | `/audit-log/date-range?start=&end=` | Filtrar por rango de fechas |
| `GET` | `/audit-log/verify-integrity` | Verificar integridad de la cadena blockchain |
| `GET` | `/health` | Health check |

---

## Estructura de Datos

### user-service (DB: `lost_found_users`)

| Modelo | Campos |
|---|---|
| **User** | `id` (UUID), `email` (único), `name`, `role` (ADMIN\|STUDENT), `createdAt`, `updatedAt` |

### object-service (DB: `lost_found_objects`)

| Modelo | Campos |
|---|---|
| **Object** | `id` (UUID), `name`, `description`, `photo` (URL), `category` (enum: ELECTRONIC, COMMON, CLOTHING, STATIONERY, DOCUMENT, ACCESSORY, OTHER), `location`, `storageLocation`?, `status`, `foundAt`, `createdAt`, `updatedAt` |

### claim-service (DB: `lost_found_claims`)

| Modelo | Campos |
|---|---|
| **Claim** | `id` (UUID), `status` (PENDING\|APPROVED\|REJECTED), `rejectionReason`?, `lostLocation`?, `userId`, `objectId`, `evidences`, `createdAt`, `updatedAt` |
| **Evidence** | `id` (UUID), `url`?, `type`, `description`?, `claimId`, `createdAt`, `updatedAt` |
| **OutboxEvent** | `id` (UUID), `topic`, `payload` (JSON), `status`, `retryCount`, `nextAttemptAt`, `lastError`?, `publishedAt`?, `createdAt` |

Único por usuario+objeto — un usuario solo puede reclamar un objeto una vez.

### audit-service (DB: `audit_log_db`)

| Modelo | Campos |
|---|---|
| **AuditLog** | `id` (UUID), `action`, `entityType`, `entityId`, `actorId`, `actorRole`, `ipAddress`, `previousHash`?, `hash` (SHA-256, único), `payload` (JSON), `result`, `details`?, `timestamp` |

Cada entrada contiene el hash SHA-256 del contenido y del hash anterior, formando una cadena inmutable verificable.

---

## Frontend

### Páginas públicas

| Ruta | Componente |
|---|---|
| `/` | Catálogo de objetos (búsqueda, filtros) |
| `/objects/:id` | Detalle del objeto |
| `/claims/create` | Crear reclamación |
| `/claims/:id` | Ver reclamación |
| `/login` | Iniciar sesión (solo email) |
| `/register` | Registro |
| `/unauthorized` | Acceso denegado |

### Páginas de estudiante (`/mis-reclamaciones`)

| Ruta | Componente |
|---|---|
| `/mis-reclamaciones` | Mis reclamaciones |

### Páginas de administrador

| Ruta | Componente |
|---|---|
| `/admin` | Dashboard (estadísticas, actividad reciente) |
| `/admin/claims` | Lista de reclamaciones |
| `/admin/objects` | Catálogo de objetos (CRUD) |
| `/admin/objects/create` | Crear objeto |
| `/admin/objects/:id/edit` | Editar objeto |
| `/admin/audit-logs` | Logs de auditoría global |
| `/admin/claims/:id/audit` | Auditoría de reclamación |

**Stack**: React 19, Vite 8, Tailwind CSS 4, shadcn/ui (Radix), React Router 7, TanStack Query, Zustand, React Hook Form, Zod, Sonner.

---

## Autenticación

Sistema simplificado basado en email:

1. El frontend envía `GET /users/me?email=` al user-service
2. Si el email existe, retorna el usuario; si no, lo auto-crea
3. El rol se asigna: emails con "admin" → ADMIN, resto → STUDENT
4. Zustand (`useAuthStore`) persiste el usuario en localStorage
5. Todas las peticiones API incluyen headers `x-user-id` y `x-user-role`
6. `ProtectedRoute` protege rutas por rol; redirige a `/login` o `/unauthorized`

---

## Patrones de Diseño

| Patrón | Servicio | Descripción |
|---|---|---|
| **Transactional Outbox** | claim-service | Publicación confiable de eventos de auditoría a RabbitMQ |
| **Chain of Responsibility** | claim-service | Verificación de reclamaciones: Identity → Availability → EvidenceMatch |
| **Factory** | claim-service | `ClaimFactoryProvider` → `ElectronicClaimFactory` / `CommonClaimFactory` |
| **Visitor** | claim-service | `AuditVisitor` y `TextSimilarityVisitor` para auditorías de reclamos |
| **Anti-Corruption Layer** | claim-service | Normaliza inputs y transforma respuestas con enmascaramiento por rol |
| **Service Proxy** | claim-service | `ClaimsServiceProxy` aplica control de acceso antes del servicio |
| **Decorator + Interceptor** | claim-service | `@AuditAction` con `AuditLogInterceptor` para auditoría automática |
| **Blockchain Integrity** | audit-service | SHA-256 encadenado, verificable vía `/audit-log/verify-integrity` |
| **Service Discovery** | claim-service | Registro y health check en HashiCorp Consul |
| **Repository Pattern** | audit-service | Puerto de dominio con implementación Prisma |

---

## Variables de Entorno

### Raíz (`.env`)

Copiar `.env.example` → `.env`:

```bash
cp .env.example .env
```

Variables principales con sus valores por defecto:

```env
DB_PORT=5432
AUDIT_DB_PORT=5433
RABBITMQ_PORT=5672
CONSUL_PORT=8500
CLAIMS_PUBLIC_PORT=3000
AUDIT_PUBLIC_PORT=3001
USER_PUBLIC_PORT=3002
OBJECT_PUBLIC_PORT=3003
FRONTEND_PUBLIC_PORT=5173
```

### Frontend (`.env`)

Solo necesario para desarrollo local con `npm run dev`. En Docker se pasan como build args.

```
VITE_CLAIMS_API_URL=http://localhost:3000
VITE_AUDIT_API_URL=http://localhost:3001
VITE_USER_API_URL=http://localhost:3002
VITE_OBJECT_API_URL=http://localhost:3003
```

---

## Tests

```bash
# Tests unitarios
cd services/claim-service && npm test
cd services/audit-service && npm test

# Tests E2E
cd services/claim-service && npm run test:e2e
cd services/audit-service && npm run test:e2e

# Tests del frontend
cd frontend && npm test
```

### Cobertura

```bash
npm run test:cov
```

---

## Solución de Problemas

### Error "Cannot GET /objects" 404
El frontend apunta al puerto incorrecto. Verifica que los puertos en el `.env` raíz coinciden con los defaults del frontend o con el `frontend/.env` (si existe). Reconstruye el frontend con `docker compose build --no-cache frontend`.

### Error "Foreign key constraint violated" al crear claims
Las FK constraints se eliminaron en la migración `20260601033000_drop_fk_constraints`. Verifica que la migración se aplicó: `docker logs lost_found_claim_service | grep drop_fk`.

### Error "The table does not exist" en user/object service
Los servicios sin migraciones usan `prisma db push`. Si falla, verifica que la base de datos existe y el usuario tiene permisos.

### Consul connection refused
Consul escucha en el puerto 8500 internamente. El claim-service debe apuntar a `consul:8500`. Verifica `CONSUL_PORT` en `.env`.

### Objetos duplicados en el catálogo
El seed del object-service usa `deleteMany` antes de crear. Si ves duplicados, reinicia el contenedor: `docker compose restart object-service`.

### El frontend no muestra reclamaciones en admin
El endpoint `GET /claims` requiere headers `x-user-id` y `x-user-role: ADMIN`. Inicia sesión con `admin@uninorte.edu.co`.
