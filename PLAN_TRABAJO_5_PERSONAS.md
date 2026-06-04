# Plan de Trabajo — 5 Personas (v2.0)

> **Objetivo:** Dividir los arreglos del backend y el desarrollo del frontend en 5 flujos de trabajo paralelos, balanceando carga, dependencias y habilidades.
> **Basado en:** Revisión de oracle que identificó sobrecarga en P5, infrautilización en P2, trabajo no asignado y dependencias faltantes.

---

## Dependencias Clave

```
Día 1                          Semana 1                    Semana 2
├──────────────────────────────┼──────────────────────────────┤

P1 (Backend Core) ───────────► P2 (Backend API + Docs) ──┐
       │                                                   │
       ▼                                                   ▼
P3 (Backend Infra) ──────────────────────────────────► Integración
       │                                                   ▲
       ▼                                                   │
P4 (Frontend Base) ───────────► P5 (Frontend Páginas) ────┘
       │                           │
       └── P5 arranca DÍA 1 con mocks, sin esperar a P4 ──┘
```

### Reglas de convivencia
- **`schema.prisma`**: Solo P1 lo toca. P3 pasa sus requisitos (índices, unique) a P1 quien los implementa en una sola migración. Sin excepción.
- **`claims.service.ts`**: P1 mergea primero (F4/F21/F22). P3 hace pull y aplica F16 después. P2 no toca este archivo.
- **seed data**: P3 puede empezar con el seed de audit-service inmediato. El seed de claims-service espera a que P1 termine F2 (schema con name/status).
- **Frontend con mocks**: P5 construye páginas con datos mock desde el día 1, sin esperar a P4 ni al backend.

---

## Persona 1 — Backend Core: Validación, Seguridad y Schema (⭐ Owner único de schema)

**Rol:** Arreglar la base del backend. Sin esto, el sistema no funciona. **Único responsable de `schema.prisma` y migraciones.**

| # | Tarea | Archivos | Depende de | Esfuerzo |
|---|-------|----------|-----------|----------|
| **F1** | Agregar `ValidationPipe` global (whitelist + forbidNonWhitelisted + transform) | `claims/main.ts`, `audit/main.ts` | — | ⏱️ 15min |
| **F2** | Agregar campos `name` y `status` al modelo `Object` + migración | `prisma/schema.prisma`, `seed.cjs` | — | ⏱️ 30min |
| **F4** | Ownership checks en `update()`, `remove()`, `create()` (comparar userId vs header) | `claims.service.ts`, `claims.controller.ts` | — | ⏱️ 45min |
| **F11** | Crear global exception filter + registrar en main.ts | `global-exception.filter.ts`, `main.ts` | — | ⏱️ 30min |
| **F13** | Agregar índices a Object, Claim, Evidence (P3 pasa requisitos) | `prisma/schema.prisma` | — | ⏱️ 15min |
| **F14** | Agregar `@@unique([userId, objectId])` en Claim (P3 pasa requisito) | `prisma/schema.prisma` | — | ⏱️ 10min |
| **F21** | Validar `objectCategory` contra la BD (usar categoría real del objeto) | `claims.service.ts` | — | ⏱️ 30min |
| **F22** | Validar que `userId` exista en tabla User antes de crear claim | `claims.service.ts` | — | ⏱️ 20min |
| **F23** | Envolver `remove()` con ACL (`toClaimResponse`) | `claims.controller.ts` | — | ⏱️ 15min |
| **F25** | Configurar CORS con origen restringido desde env | `claims/main.ts` | — | ⏱️ 15min |
| **F27** | Alias `Object` de Prisma para no shadowear global | `claim-verification.types.ts` | — | ⏱️ 10min |
| **Migración única** | Unificar F2+F13+F14 en un solo `prisma migrate dev` | `schema.prisma` | — | ⏱️ 15min |

**Total estimado:** ~4.5 horas

**Dependencias:** Ninguna. Arranca día 1.

**Entrega:** Backend con validaciones funcionando, seguridad básica, schema corregido con índices y unique constraint.

---

## Persona 2 — Backend API: Domain Patterns, DTOs, Docs y Tests

**Rol:** Lógica de negocio (patrones GoF, validación de evidencias) + Swagger + Health audit + Tests de handlers/factories.

| # | Tarea | Archivos | Depende de | Esfuerzo |
|---|-------|----------|-----------|----------|
| **F3** | Eliminar doble emisión de auditoría (sacar direct emit del interceptor) | `audit-log.interceptor.ts` | — | ⏱️ 30min |
| **F6** | Agregar `rejectionReason` a `UpdateClaimDto` | `update-claim.dto.ts` | — | ⏱️ 15min |
| **F7** | Crear enum `EvidenceType` y validar en DTO | `create-claim.dto.ts` | — | ⏱️ 30min |
| **F8+F28** | Agregar `@IsArray()` + `@ArrayMinSize(1)` en evidences | `create-claim.dto.ts` | — | ⏱️ 15min |
| **F12** | Sincronizar `EvidenceMatchHandler` con `ElectronicClaimFactory` | `evidence-match.handler.ts` | — | ⏱️ 30min |
| **F19** | Transacción de solo lectura en `verifyIntegrity()` | `audit-log.service.ts` | — | ⏱️ 20min |
| **F20** | Corregir ruteo de `ACCESSORY` en factory + handler | `claim-factory.provider.ts`, `evidence-match.handler.ts` | — | ⏱️ 30min |
| **F24** | Alinear `EvidenceDto.description` entre DTO y factory | `create-claim.dto.ts`, `common-claim.factory.ts` | — | ⏱️ 20min |
| **NF4** | Swagger/OpenAPI: setup + decorar controladores principales | `main.ts` (ambos servicios), controllers | — | ⏱️ 2h |
| **NF5** | Health endpoint en audit-service + cambiar health check en docker-compose | `audit/app.controller.ts`, `docker-compose.yml` | — | ⏱️ 30min |
| **NF6 (parcial)** | Tests unitarios para handlers (identity, availability, evidence-match) y factories | `*.spec.ts` | — | ⏱️ 2h |

**Total estimado:** ~7.5 horas

**Dependencias:** F1 de P1 para que validaciones funcionen realmente. Puede preparar todo el código en paralelo y probar cuando P1 mergee.

**Entrega:** DTOs correctos, validación de evidencias funcional, sin doble auditoría, Swagger docs, health endpoint, handlers+factories testeados.

---

## Persona 3 — Backend Infra: Outbox, Seed, CI/CD y Features

**Rol:** Outbox robusto, seed data completa, nuevos endpoints, paginación, CI/CD.

| # | Tarea | Archivos | Depende de | Esfuerzo |
|---|-------|----------|-----------|----------|
| **F5 (parcial)** | Seed para audit-service (entradas de audit log encadenadas con hashes) | `audit/prisma/seed.ts` | — | ⏱️ 30min |
| **F9+F10** | Outbox: FOR UPDATE SKIP LOCKED + timeout PROCESSING | `outbox.service.ts` | — | ⏱️ 1h |
| **F15** | Validar query params en audit controller | `audit-log.controller.ts` | — | ⏱️ 20min |
| **F16** | Validar body vacío en UpdateClaimDto (hacer pull después de P1) | `claims.service.ts` | F4 de P1 | ⏱️ 15min |
| **F17** | Eliminar `seed.ts` (duplicado muerto) | `prisma/seed.ts` | — | ⏱️ 5min |
| **F18** | Cambiar `require()` a `import` en ServiceDiscovery | `service-discovery.service.ts` | — | ⏱️ 15min |
| **F26** | Cambiar health check audit-service a `/health` (después de NF5 de P2) | `docker-compose.yml` | NF5 de P2 | ⏱️ 15min |
| **F5 (completo)** | Seed claims-service: admin user + objetos todas categorías + claims + evidences | `seed.cjs` | F2 de P1 | ⏱️ 1h |
| **NF2** | Paginación en claims + objects | `claims.controller.ts`, `objects.controller.ts` | — | ⏱️ 1h |
| **NF6 (parcial)** | Tests para outbox.service, claims.service.proxy | `*.spec.ts` | — | ⏱️ 1.5h |
| **NF7** | GitHub Actions CI workflow | `.github/workflows/ci.yml` | — | ⏱️ 45min |

**Total estimado:** ~7.5 horas

**Dependencias:** F5 (claims seed) espera F2 de P1. F16 espera F4 de P1. F26 espera NF5 de P2. El resto arranca día 1.

**Entrega:** Outbox robusto sin race conditions, seed completo, paginación operativa, CI/CD corriendo.

---

## Persona 4 — Frontend Base: Setup, Design System, UI, Layouts + Auth Pages

**Rol:** Crear el proyecto frontend desde cero + design system + componentes UI + layouts + páginas de autenticación.

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| **Setup** | Inicializar Vite + React 19 + TS, instalar dependencias (shadcn, TanStack Query, Zustand, RHF, Zod, Sonner, Lucide, date-fns) | `package.json`, `vite.config.ts`, `tsconfig.json` | ⏱️ 30min |
| **Config** | Tailwind con tokens de diseño (colores, radios, fuentes del design.md) + variables CSS | `tailwind.config.ts`, `index.css` | ⏱️ 1h |
| **shadcn** | Inicializar + agregar componentes: Button, Card, Dialog, Input, Select, Table, Badge, Skeleton, Tabs, Sheet, Separator, DropdownMenu, Avatar, Label, Textarea | `components/ui/` | ⏱️ 45min |
| **UI extras** | Componentes personalizados: EmptyState, ErrorState, Spinner, LoadingButton, SearchField, Pagination, ConfirmModal, Modal, Toaster, StatusBadge | `components/ui/` | ⏱️ 2h |
| **API client** | Fetch wrapper tipado con manejo de errores, AbortController, headers de auth automáticos | `lib/api.ts` | ⏱️ 45min |
| **Stores** | AuthStore (Zustand con persistencia) + TanStack Query provider + Sonner Toaster | `stores/authStore.ts`, `main.tsx` | ⏱️ 45min |
| **Layouts** | App shell: PublicLayout (navbar+footer), StudentLayout (navbar+footer), AdminLayout (sidebar+topbar) | `components/layout/` | ⏱️ 2.5h |
| **Routing** | React Router 7 tree con guards + lazy loading + Auth hydration screen | `App.tsx`, `components/routing/` | ⏱️ 1.5h |
| **Hooks** | useDebounce, useApi (estado loading/error/data genérico) | `hooks/` | ⏱️ 30min |
| **Types** | Enums y tipos compartidos (Role, ObjectCategory, ClaimStatus, EvidenceType, AuthUser) | `types/index.ts` | ⏱️ 20min |
| **Schemas** | Zod schemas: claim.schema, object.schema, auth.schema | `schemas/` | ⏱️ 45min |
| **Auth pages** | LoginPage + RegisterPage + NotFoundPage + UnauthorizedPage | `pages/` | ⏱️ 1.5h |

**Total estimado:** ~12.5 horas (con buffer realista)

**Dependencias:** Ninguna. Arranca día 1.

**Entrega:** Proyecto frontend listo con design system, todos los componentes UI, layouts, routing, stores, API client, + 4 páginas de autenticación. P5 puede empezar.

---

## Persona 5 — Frontend Páginas: 13 vistas + Tests

**Rol:** Implementar las páginas del estudiante y admin, conectándolas al backend. **Arranca con mocks desde el día 1, no espera a P4.**

| # | Vista | Ruta | API Calls | Depende de | Esfuerzo |
|---|-------|------|-----------|-----------|----------|
| **CatalogPage** | Grid + búsqueda + filtros + paginación | `/` | `GET /objects` | — | ⏱️ 3h |
| **ObjectDetailPage** | Detalle + CTA reclamar | `/objects/:id` | `GET /objects/:id` | — | ⏱️ 1.5h |
| **CreateClaimPage** | Formulario reclamo + evidencias | `/objects/:id/claim` | `GET /objects/:id`, `POST /claims` | — | ⏱️ 2.5h |
| **MyClaimsPage** | Lista reclamos del estudiante | `/mis-reclamaciones` | `GET /claims/my` | — | ⏱️ 1.5h |
| **ClaimDetailPage** | Detalle read-only (estudiante) | `/claims/:id` | `GET /claims/:id` | — | ⏱️ 1.5h |
| **AdminDashboardPage** | Stats + actividad reciente | `/admin` | `GET /admin/stats` | ⚠️ Endpoint a confirmar | ⏱️ 2h |
| **AdminObjectsListPage** | CRUD objetos (lista) | `/admin/objects` | `GET /objects`, `DELETE /objects/:id` | — | ⏱️ 1.5h |
| **AdminCreateObjectPage** | Formulario crear objeto | `/admin/objects/new` | `POST /objects` | — | ⏱️ 2h |
| **AdminEditObjectPage** | Formulario editar objeto | `/admin/objects/:id/edit` | `GET /objects/:id`, `PATCH /objects/:id` | — | ⏱️ 1.5h |
| **AdminClaimsListPage** | Tabla reclamos + filtros | `/admin/claims` | `GET /claims` | — | ⏱️ 2.5h |
| **AdminClaimDetailPage** | Escritorio revisión + CoR + Approve/Reject | `/admin/claims/:id` | `GET /claims/:id`, `POST /claims/:id/verify`, `PATCH /claims/:id` | — | ⏱️ 4h |
| **ClaimAuditPage** | Reporte auditoría con scores | `/admin/claims/:id/audit` | `GET /claims/:id/audit` | — | ⏱️ 2h |
| **GlobalAuditLogPage** | Bitácora global + integrity check | `/admin/audit-log` | `GET /audit-log`, `GET /audit-log/verify-integrity` | — | ⏱️ 2h |
| **NF6 (parcial)** | Integration tests para flujo crítico (crear claim → verificar → aprobar) | `test/` | — | — | ⏱️ 2h |

**Total estimado:** ~29 horas (estimación realista con buffer)

**Dependencias:** Layouts y componentes de P4 (~mitad semana 1). Backend endpoints de P3 (mitad semana 2). **Arranca día 1 con mocks.**

**Estrategia de mocks:**
```ts
// Mientras no existan los componentes de P4, usa HTML simple + Tailwind
// Mientras no existan los endpoints reales, usa datos mockeados
const MOCK_OBJECTS = [ /* ... */ ];
const { data } = useQuery({
  queryKey: ['objects'],
  queryFn: () => new Promise(r => setTimeout(() => r(MOCK_OBJECTS), 300)),
  enabled: !API_READY,  // cuando API_READY=true, usa api.getObjects()
});
```

**Entrega:** Frontend completo con las 13 vistas conectadas al backend real, más integration tests del flujo crítico.

---

## Trabajo transversal (NF6 — Tests)

Los tests se distribuyen según afinidad:

| Persona | Qué testea | Esfuerzo |
|---------|-----------|----------|
| **P1** | ClaimsService (CRUD + ownership + validaciones) | ⏱️ 1h |
| **P2** | Handlers (identity, availability, evidence-match), Factories, Visitors, ACL | ⏱️ 2h |
| **P3** | OutboxService, ClaimsServiceProxy, paginación | ⏱️ 1.5h |
| **P4** | Componentes UI (Button, Modal, EmptyState, etc.), hooks, stores | ⏱️ 1.5h |
| **P5** | Integration tests E2E (crear claim → verificar → aprobar) | ⏱️ 2h |

---

## Línea de tiempo ajustada

```
          Día 1   Día 2   Día 3   Día 4   Día 5   Día 6   Día 7   Día 8   Día 9   Día 10
Semana 1 │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
Semana 2 │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│

P1 ──────███████████████████████████████████░░░░░░░░░░░░░░░░░░  4.5h  (core listo día 3)
P2 ──────█████████████████████████████████████████████████████  7.5h  (prepara paralelo, prueba día 3+)
P3 ──────█████████████████████████████████████████████████████  7.5h  (infra día 1-4, features día 4-6)
P4 ──────████████████████████████████████████████████████████  12.5h (componentes listos día 4-5)
P5 ──────████████████████████████████████████████████████████  29h   (mocks día 1, APIs reales día 5+)
         ↑                                                    ↑
     Arrancan todos                                    P5 recibe APIs de P3 + componentes de P4
```

- **P1, P2, P3, P4, P5** arrancan todos el **día 1**
- **P5** construye con mocks los primeros 4 días, luego conecta APIs reales
- **Día 5**: P1 terminó, P2 y P3 tienen lo suyo, P4 entregó componentes base
- **Día 7**: Backend features completas (NF1, NF2, NF3)
- **Día 10**: Frontend completo con integration tests

---

## Resumen de carga por persona (v2.0)

| Persona | Rol | Horas | ¿Arranca día 1? | ¿Puede trabajar independiente? |
|---------|-----|------|----------------|-------------------------------|
| **P1** | Backend Core + Schema Owner | ~4.5h | ✅ Sí | ✅ Sí |
| **P2** | Backend API + Docs + Tests | ~7.5h | ✅ Sí (prepara, prueba tras P1) | ⚠️ Parcial |
| **P3** | Backend Infra + Features | ~7.5h | ✅ Sí (tareas independientes) | ⚠️ Parcial |
| **P4** | Frontend Base + Auth Pages | ~12.5h | ✅ Sí | ✅ Sí |
| **P5** | Frontend Páginas + E2E Tests | ~29h | ✅ Sí (con mocks) | ✅ Sí (mocks día 1) |

### Cambios vs v1.0
| Aspecto | v1.0 | v2.0 |
|---------|------|-------|
| P5 carga | 23h ❌ | 29h ✅ (realista con buffer) |
| P2 carga | 2.5h ❌ (infrautilizado) | 7.5h ✅ (Swagger + Health + Tests) |
| NF4/NEF5/NEF6 | Sin dueño ❌ | Asignados a P2 y distribuido |
| schema.prisma | P1 y P3 (conflicto) ❌ | Solo P1 ✅ |
| Dependencia P5→P3 APIs | No identificada ❌ | Documentada con estrategia mocks ✅ |
| P5 arranque | Espera a P4 ❌ | Arranca día 1 con mocks ✅ |
| Frontend Auth pages | En P5 (sobrecarga) | Pasadas a P4 ✅ |
| Estimaciones | Sin buffer ❌ | Con buffer realista ✅ |
