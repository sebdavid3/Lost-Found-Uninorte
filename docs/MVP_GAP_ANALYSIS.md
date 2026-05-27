# MVP Gap Analysis — Lost & Found Uninorte

> **Fecha:** 27 de mayo de 2026
> **Propósito:** Identificar todo lo que falta para que el proyecto sea un MVP funcional.
> **Criterio MVP:** Un usuario puede entrar, ver objetos perdidos, crear un reclamo con evidencia, y un admin puede verlo, verificarlo y resolverlo — todo de principio a fin sin bugs ni workarounds.

---

## 🔴 BLOQUEANTES (8)

Sin estas correcciones, el sistema **no puede completar un flujo funcional de principio a fin**.

### B1. Frontend envía `'current-user-id'` hardcodeado

- **Archivo:** `frontend/src/pages/CatalogPage.tsx:47`
- **Problema:**
  ```ts
  userId: 'current-user-id',  // ← No es un UUID real
  ```
  El backend lee ese userId y ejecuta `findUnique({ where: { id: 'current-user-id' } })` que retorna `null`. El Chain of Responsibility (IdentityHandler) falla porque el usuario no existe.
- **Impacto:** Ningún reclamo puede completar el flujo de verificación. El MVP está roto desde el frontend.
- **Solución:** Usar el ID del usuario STUDENT creado en el seed (`cm8e5k7k60000yxb8hq5z9a1w`), o mejor, hacerlo dinámico desde un contexto de autenticación.

---

### B2. `ValidationPipe` no está configurado en ningún servicio

- **Archivo:** `services/claims-service/src/infrastructure/main.ts` (línea 8)
- **Archivo:** `services/audit-service/src/main.ts`
- **Problema:** Falta `app.useGlobalPipes(new ValidationPipe())`. Todos los decoradores `@IsString()`, `@IsEnum()`, `@ValidateNested()`, `@IsOptional()` en los DTOs son **inertes**. El backend acepta cualquier payload sin validar.
- **Impacto:** Datos inválidos (evidences sin tipo, categorías inexistentes, status incorrectos) pasan al servicio y generan errores 500 inesperados en vez de 400 con mensajes claros.
- **Solución:** Agregar en ambos `main.ts`:
  ```ts
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  ```

---

### B3. Mismatch entre Prisma Schema y Anti-Corruption Layer

- **Archivos:**
  - `services/claims-service/prisma/schema.prisma` (modelo `Object`, líneas 55–65)
  - `services/claims-service/src/infrastructure/acl/anti-corruption-layer.service.ts` (líneas 31–39, interfaz `ClaimResponseDto`)
- **Problema:** El ACL define `object.name: string` y `object.status: FoundObject['status']`, pero el modelo Prisma `Object` **no tiene** campos `name` ni `status`. Solo tiene `description`, `photo`, `category`, `location`, `foundAt`.
- **Impacto:** Toda respuesta de `GET /claims`, `GET /claims/:id`, `POST /claims` incluye `"name": undefined` y `"status": undefined` en el objeto anidado.
- **Solución:** Agregar los campos `name` y `status` al modelo Prisma `Object`, crear migración, y actualizar el seed.

---

### B4. Doble emisión de eventos de auditoría

- **Archivos:**
  - `services/claims-service/src/application/interceptors/audit-log.interceptor.ts` (línea 91) — emite directo a RabbitMQ
  - `services/claims-service/src/application/services/claims.service.ts` — cada método encola un evento via `outboxService.enqueueAuditEvent()`
- **Problema:** Cada acción auditable produce **dos eventos idénticos** para el mismo request. El interceptor emite directo, y el OutboxService también.
- **Impacto:** El audit-service recibe eventos duplicados, duplicando el almacenamiento y rompiendo la cadena de hashes (el `previousHash` se desincroniza).
- **Solución:** Elegir una sola vía. La correcta es la del **Outbox Pattern** (transaccional). Eliminar la emisión directa del interceptor y que solo encargue eventos via outbox.

---

### B5. Seed data insuficiente

- **Archivo:** `services/claims-service/prisma/seed.cjs` (y `seed.ts` que está muerto)
- **Problemas:**
  - Solo **1 usuario** (`student@uninorte.edu.co`) — sin admin para probar endpoints de administración
  - Solo **2 objetos** (ELECTRONIC + COMMON) — faltan 5 categorías: `CLOTHING`, `STATIONERY`, `DOCUMENT`, `ACCESSORY`, `OTHER`
  - **Cero claims, cero evidences, cero outbox events** — no se puede probar el core del sistema
  - **Cero audit logs** — no se puede probar audit-service
  - No hay archivo seed para `services/audit-service/prisma/`
- **Impacto:** Arrancar el proyecto con `docker-compose up` deja una BD vacía sin datos de prueba. El desarrollador no puede probar ningún flujo real.
- **Solución:**
  - Agregar un usuario ADMIN
  - Agregar objetos de todas las categorías (mínimo 1 por categoría)
  - Crear claims de ejemplo en varios estados (PENDING, APPROVED, REJECTED) con evidences asociadas
  - Crear seed para audit-service con entradas de audit log

---

### B6. Sin configuración de nginx para SPA routing

- **Archivo:** `frontend/Dockerfile`
- **Problema:** Usa la configuración default de nginx, que no incluye `try_files $uri $uri/ /index.html;`. React Router maneja las rutas del lado del cliente.
- **Impacto:** Refrescar la página o acceder directamente a `/admin`, `/catalog`, o cualquier ruta que no sea `/` devuelve **404 desde nginx**. La app es inusable en producción.
- **Solución:** Crear `frontend/nginx.conf`:
  ```nginx
  server {
      listen 80;
      server_name _;
      root /usr/share/nginx/html;
      index index.html;
      location / {
          try_files $uri $uri/ /index.html;
      }
  }
  ```
  Y copiarlo en el Dockerfile.

---

### B7. Sin archivos `.env`

- **Archivos:** `/.env.example`, `/frontend/.env.example`, `/services/claims-service/.env.example`, `/services/audit-service/.env.example`
- **Problema:** Solo existen `.env.example`, ningún `.env` real. El `docker-compose.yml` usa `${VAR:-default}` así que arranca con valores por defecto: `password123` para todas las contraseñas de BD, y el frontend en Docker no tiene `VITE_API_BASE_URL`.
- **Impacto:**
  - Contraseñas inseguras en producción
  - El frontend en Docker no sabe cómo llegar al backend (apunta a `window.location.hostname:3000` que puede no funcionar)
- **Solución:** Crear archivos `.env` a partir de los `.example` antes de hacer `docker-compose up`. Incluir valores seguros para desarrollo local.

---

### B8. Admin optimiza estado aunque la API falle

- **Archivo:** `frontend/src/pages/AdminPanelPage.tsx` (líneas 44–48, 58–62)
- **Problema:**
  ```ts
  catch (err) {
    alert('Error... (Simulando éxito para el Paso 5)');
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: ClaimStatus.APPROVED } : c));
    setSelectedClaim(null);
  }
  ```
  Ambos `handleApprove` y `handleReject` actualizan el estado local como si la operación hubiera funcionado, incluso cuando la API lanza error. Es código legacy de desarrollo ("Simulando éxito para el Paso 5").
- **Impacto:** El admin ve el reclamo como APPROVED/REJECTED en pantalla aunque el backend haya rechazado la operación o devuelto error. **Pérdida de integridad de datos** — el admin cree que hizo algo que en realidad no ocurrió.
- **Solución:** Eliminar la actualización optimista del catch. Mostrar el error al usuario y **no** modificar el estado local.

---

## 🟠 ALTOS (8)

Funcionalidad crítica que está limitada o ausente. El sistema funciona pero con experiencia de usuario pobre o comportamiento incorrecto.

### H1. Sin autenticación real

- **Archivo:** `frontend/src/pages/AdminPanelPage.tsx` (líneas 80–92)
- **Problema:** El único mecanismo de roles es un toggle "Simular Rol" en la interfaz. Cualquiera puede impostar ADMIN. No hay login, no hay AuthContext, no hay JWT ni sesiones. Los headers `x-user-role` y `x-user-id` los define el cliente sin verificación del servidor.
- **Impacto:** Cero seguridad. Cualquier persona puede ver todos los reclamos, aprobar/rechazar, y acceder al panel de admin.
- **Solución MVP:** Implementar un login simulado (formulario que selecciona usuario de la BD) con un AuthContext que almacene rol y userId. Para un MVP esto es suficiente; la seguridad real (JWT, OAuth) queda para producción.

---

### H2. Objects CRUD es solo lectura

- **Archivo:** `services/claims-service/src/infrastructure/objects/objects.controller.ts`
- **Problema:** Solo existen `GET /objects` y `GET /objects/:id`. No hay:
  - `POST /objects` — registrar objeto encontrado
  - `PATCH /objects/:id` — actualizar detalles
  - `DELETE /objects/:id` — eliminar objeto
  - `GET /objects?category=...&location=...&q=...` — filtrado/búsqueda
- **Impacto:** No se pueden agregar objetos perdidos al sistema. El catálogo es estático, poblado solo por seed data.
- **Solución MVP:** Implementar los endpoints CRUD básicos para objects, al menos `POST` y búsqueda por categoría.

---

### H3. Sin paginación en endpoints de lista

- **Archivos:**
  - `services/claims-service/src/infrastructure/controllers/claims.controller.ts` — `findAll()`, `findByStatus()`, `findByDateRange()`
  - `services/claims-service/src/infrastructure/objects/objects.controller.ts` — `findAll()`
- **Problema:** Todos los endpoints que listan registros ejecutan `findMany()` sin `skip`/`take`. Cargan **todos** los registros en memoria.
- **Impacto:** Con 100+ objetos o claims, el rendimiento se degrada. Con 1000+, el servidor se queda sin memoria o la respuesta es extremadamente lenta.
- **Solución:** Agregar query params `page` y `limit` con valores por defecto (e.g., `page=1`, `limit=20`) y usarlos en los Prisma queries.

---

### H4. Sin índices en la base de datos

- **Archivo:** `services/claims-service/prisma/schema.prisma`
- **Problema:** No hay índices en los campos más consultados:
  | Modelo | Campo(s) | Uso |
  |--------|----------|-----|
  | `Object` | `category` | Filtrado por categoría |
  | `Object` | `location` | Búsqueda por ubicación |
  | `Object` | `foundAt` | Filtro por fecha |
  | `Claim` | `userId` | Búsqueda de claims por usuario |
  | `Claim` | `objectId` | Availability handler |
  | `Claim` | `status` | Filtrado por estado |
  | `Claim` | `(objectId, status)` | Availability handler |
  | `Evidence` | `claimId` | Carga de evidencias por claim |
- **Impacto:** Cada consulta hace `seq scan` sobre toda la tabla. El rendimiento empeora linealmente con el volumen de datos.
- **Solución:** Agregar índices en Prisma schema y crear migración.

---

### H5. Sin ownership checks en update/delete

- **Archivo:** `services/claims-service/src/infrastructure/controllers/claims.controller.ts` (líneas 102, 112)
- **Archivo:** `services/claims-service/src/application/services/claims.service.ts`
- **Problema:**
  - `update()` y `remove()` no verifican que `claim.userId === authenticatedUserId`. Solo verifican que el claim esté en estado PENDING.
  - `create()` no verifica que el `userId` del body coincida con el usuario autenticado.
- **Impacto:** Estudiante A puede modificar o eliminar el reclamo del Estudiante B. Un estudiante puede crear un claim a nombre de otro usuario.
- **Solución:** Agregar ownership checks en el servicio antes de permitir update/delete. Validar en create que `userId === authenticatedUserId`.

---

### H6. Sin estados de error en frontend

- **Archivos:**
  - `frontend/src/pages/CatalogPage.tsx` (líneas 22–23) — Error en fetch solo hace `console.error`
  - `frontend/src/pages/AdminPanelPage.tsx` (línea 26) — Error en fetch solo hace `console.error`
- **Problema:** Cuando la API falla, el usuario ve exactamente la misma interfaz que cuando no hay datos. "No hay objetos perdidos" es indistinguible de "Error de conexión con el servidor".
- **Impacto:** El usuario cree que no hay datos cuando en realidad hay un error. Experiencia frustrante y confusa.
- **Solución:** Agregar estado `error` en los componentes, mostrar un mensaje de error claro con opción de reintentar, y distinguir visualmente del estado vacío.

---

### H7. Sin estados de carga en botones de acción

- **Archivos:**
  - `frontend/src/components/ClaimForm.tsx` — Botón "Enviar Reclamación"
  - `frontend/src/components/ClaimDetailModal.tsx` (líneas 146–159) — Botones Approve/Reject
- **Problema:** Ninguno de los botones de acción tiene estado de carga (`loading`). El usuario puede hacer clic múltiples veces, enviando requests duplicados.
- **Impacto:** Claims duplicados, múltiples aprobaciones/rechazos para el mismo reclamo, experiencia confusa.
- **Solución:** Agregar estado `isSubmitting`/`isApproving`/`isRejecting` a cada botón, deshabilitarlo durante la operación, y mostrar un spinner.

---

### H8. EvidenceMatchHandler incompatible con ElectronicClaimFactory

- **Archivos:**
  - `services/claims-service/src/application/handlers/evidence-match.handler.ts` (líneas 7–9)
  - `services/claims-service/src/application/factories/electronic-claim.factory.ts` (líneas 11–12)
- **Problema:** El handler solo verifica `type === 'SERIAL_NUMBER'` como evidencia válida. El factory permite `SERIAL_NUMBER` **O** `DIGITAL_INVOICE`. Un claim con solo factura digital **pasa la validación del factory** (se crea exitosamente) pero **siempre falla la verificación del handler**.
- **Impacto:** Falso negativo garantizado: claims legítimos con factura digital se rechazan automáticamente.
- **Solución:** Sincronizar ambos: que el handler también acepte `DIGITAL_INVOICE` como evidencia válida para electrónicos, o centralizar las constantes de tipos de evidencia en un enum compartido.

---

## 🟡 MEDIOS (7)

Afectan la calidad de vida del desarrollador, la mantenibilidad, o la confianza en el sistema.

### M1. Sin cobertura de tests

- **claims-service:** 37 archivos fuente → solo **1 archivo con tests reales** (ACL). El resto son stubs de `shouldBeDefined()` del scaffold de NestJS.
- **audit-service:** 14 archivos fuente → **0 tests reales**.
- **Frontend:** **0 tests**, ni siquiera Vitest/jest instalado como dependencia.
- **Sin testear:** Handlers (CoR), Factories, Visitors, Proxies, Outbox, Service Discovery, Controllers, exception filters, audit service.
- **Solución MVP:** Al menos tests unitarios para los patrones clave (CoR handlers, factories, visitors) y tests de integración para el flujo crítico (crear + verificar claim).

---

### M2. Sin CI/CD

- **Problema:** No hay archivos `.github/workflows/`, `.gitlab-ci.yml`, ni ningún pipeline de integración continua.
- **Impacto:** Cada merge a `main` o PR no ejecuta tests automáticamente. No hay validación de que el código compile, pase lint, o los tests existentes sigan pasando.
- **Solución MVP:** Crear un workflow básico de GitHub Actions que ejecute `npm run test` y `npm run build` en los servicios ante cada PR y push a `main`.

---

### M3. Sin Swagger / OpenAPI

- **Problema:** No hay decoradores de `@nestjs/swagger` en ningún endpoint. No hay documentación de API visible.
- **Impacto:** Cualquier nuevo desarrollador (o el frontend) tiene que leer el código de los controladores para entender qué parámetros acepta cada endpoint y qué respuesta devuelve.
- **Solución:** Agregar `@nestjs/swagger`, decorar los endpoints principales, y habilitar Swagger UI en `/api/docs`.

---

### M4. Race condition en Outbox

- **Archivo:** `services/claims-service/src/application/services/outbox.service.ts` (líneas 34–71, método `reserveBatch()`)
- **Problema:** El método primero lee candidatos con `findMany` (sin lock), luego itera y hace `updateMany` con locking optimista (`where: { id, status: PENDING }`). Dos instancias concurrentes pueden leer el mismo batch; solo una gana cada fila, pero es ineficiente.
- **Solución:** Usar una query raw con `SELECT ... FOR UPDATE SKIP LOCKED` (soportado por PostgreSQL) para reservar eventos atómicamente.

---

### M5. Eventos PROCESSING huérfanos

- **Archivo:** `services/claims-service/src/application/services/outbox.service.ts` (líneas 37–43)
- **Problema:** El WHERE de `reserveBatch()` solo consulta `PENDING` o `FAILED`. Si el publisher crashea a mitad de la publicación, el evento queda en estado `PROCESSING` para siempre. No hay mecanismo de timeout/recuperación.
- **Impacto:** Eventos que nunca se entregan, pérdida de datos de auditoría silenciosa.
- **Solución:** Agregar una ventana de tiempo: incluir eventos en `PROCESSING` cuyo `nextAttemptAt` sea anterior a `now() - 5 minutes`.

---

### M6. Sin ruta para que estudiantes vean sus reclamos

- **Frontend:** No existe una página "Mis Reclamaciones" ni un endpoint `GET /claims/my`.
- **Problema:** El estudiante crea un reclamo y **nunca sabe qué pasó**. No hay forma de ver el estado (si está pendiente, aprobado o rechazado).
- **Impacto:** Experiencia de usuario incompleta. El core del sistema (crear reclamo + seguimiento) no está cerrado.
- **Solución MVP:** Agregar ruta `/mis-reclamaciones` en frontend con lista filtrada por userId. En backend, agregar `GET /claims/my` que use el userId del header.

---

### M7. Sin `@@unique([userId, objectId])` en Claim

- **Archivo:** `services/claims-service/prisma/schema.prisma` (modelo `Claim`)
- **Problema:** No hay restricción unique compuesta. Un usuario puede crear múltiples claims para el mismo objeto.
- **Impacto:** Confusión durante la verificación — ¿cuál claim es el válido? Posible abuso (flood de claims).
- **Solución:** Agregar `@@unique([userId, objectId])` al modelo Claim y manejar el error P2002 con un mensaje claro.

---

## 🔵 BAJOS (9)

Problemas cosméticos, de estilo, o que no afectan la funcionalidad pero reducen la calidad general.

| # | Issue | Detalle | Solución |
|---|-------|---------|----------|
| L1 | `rejectionReason` no está en `UpdateClaimDto` | Solo existe `status`. Si se agrega `whitelist: true` en ValidationPipe, el campo se pierde silenciosamente. | Agregar `@IsOptional() @IsString() rejectionReason?: string` al DTO. |
| L2 | `mockData.ts` muerto | 56 líneas, no se importa en ningún lado. | Eliminar el archivo. |
| L3 | Enums usados como strings literales | `'ADMIN'` en vez de `Role.ADMIN`, `'PENDING'` en vez de `ClaimStatus`, `'SERIAL_NUMBER'` como magic string. | Reemplazar con referencias a los enums. |
| L4 | Sin `@ArrayMinSize(1)` en evidences | Arreglo vacío pasa validación. | Agregar `@ArrayMinSize(1)` al campo `evidences` del DTO. |
| L5 | Sin ruta 404 catch-all en frontend | Navegar a `/ruta-inexistente` no muestra página de error. | Agregar `<Route path="*" element={<NotFound />} />` en App.tsx. |
| L6 | Sin confirmación en Approve/Reject | Se ejecutan sin "¿Estás seguro?". | Agregar `window.confirm()` o un modal de confirmación. |
| L7 | Sin escape key / click outside en modales | Los modales `ClaimForm` y `ClaimDetailModal` no cierran con Escape ni click en backdrop. | Agregar event listeners. |
| L8 | Sin debounce en búsqueda | `CatalogPage` filtra en cada keystroke. | Agregar debounce de 300ms. |
| L9 | Sin `test` script en frontend | No hay script, no hay dependencia de testing. | Agregar `vitest` y script `"test": "vitest run"`. |

---

## 📊 Prioridad sugerida para MVP

```
Fase 1 — Hacer funcionar el flujo core (B1–B8)
├── B1: userId real
├── B2: ValidationPipe global
├── B3: Fix Prisma/ACL mismatch
├── B4: Eliminar doble auditoría
├── B5: Seed data completa
├── B6: nginx SPA config
├── B7: Archivos .env
└── B8: Fix optimistic update falso

Fase 2 — Completar funcionalidad (H1–H8)
├── H1: AuthContext y login simulado
├── H2: Objects CRUD completo
├── H3: Paginación
├── H4: Índices de BD
├── H5: Ownership checks
├── H6: Estados de error en frontend
├── H7: Estados de carga en botones
└── H8: Sincronizar Handler ↔ Factory

Fase 3 — Calidad y mantenibilidad (M1–M7)
├── M1: Tests para flujo crítico
├── M2: CI/CD básico (GitHub Actions)
├── M3: Swagger/OpenAPI
├── M4: Fix race condition Outbox
├── M5: Timeout de eventos PROCESSING
├── M6: Ruta "Mis Reclamaciones"
└── M7: Unique constraint en Claim

Fase 4 — Pulido (L1–L9)
├── L1–L9: Correcciones menores
```

---

## 📈 Resumen numérico

| Prioridad | Cantidad | Esfuerzo estimado |
|-----------|----------|-------------------|
| 🔴 Bloqueantes | 8 | ~2–3 días |
| 🟠 Altos | 8 | ~3–4 días |
| 🟡 Medios | 7 | ~3–5 días |
| 🔵 Bajos | 9 | ~1 día |
| **Total** | **32** | **~9–13 días** |

> **Nota:** El esfuerzo estimado asume una persona trabajando enfocada, con conocimiento del código. Todos los items bloqueantes deben resolverse **antes** de considerar el proyecto un MVP funcional.
