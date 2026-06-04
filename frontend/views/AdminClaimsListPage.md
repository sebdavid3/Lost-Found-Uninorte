# AdminClaimsListPage

**Ruta:** `/admin/claims`

**Rol:** ADMIN

---

## Función

Lista maestra de todos los reclamos del sistema. Vista de tabla densa con filtros por estado (PENDING/APPROVED/REJECTED), rango de fechas, y ordenamiento. Es la herramienta principal del admin para gestionar reclamos.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| AdminClaimDetailPage (`/admin/claims/:id`) | Click en fila → detalle completo del reclamo |
| AdminDashboardPage (`/admin`) | Volver al dashboard |
| GlobalAuditLogPage (`/admin/audit-log`) | Link desde sidebar |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/claims?page=&limit=&status=&dateFrom=&dateTo=` | Listar claims con filtros |
| `GET` | `/claims/filter/status?status=` | Alternativa para filtro rápido por status |
| `GET` | `/claims/filter/date-range?start=&end=` | Alternativa para filtro por fecha |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `ClaimsTable` | Dominio | Tabla densa: ID, estudiante, objeto, fecha, status, acciones |
| `StatusFilterDropdown` | UI | Dropdown para filtrar por PENDING/APPROVED/REJECTED |
| `DateRangePicker` | UI | Selector de rango de fechas |
| `Pagination` | UI | Controles de paginación |
| `SearchField` | UI | Búsqueda por nombre de estudiante u objeto |
| `Skeleton` | shadcn | Loading state (filas de tabla) |
| `EmptyState` | UI | "No se encontraron reclamos con esos filtros" |
| `ErrorState` | UI | Error con retry |
| `Badge` | shadcn | Status badge en cada fila |
| `Button` | shadcn | Acciones por fila (ver, ver detalle) |

---

## Layout

Usa `AdminLayout`. Sidebar con "Reclamos" activo.

---

## Reglas de negocio

- Los reclamos PENDING deben destacarse visualmente (orden primero o badge más visible)
- Filtro por status: default "Todos", opciones PENDING/APPROVED/REJECTED
- Fecha: date range picker con presets "Hoy", "Últimos 7 días", "Último mes"
- Paginación: 15 items por defecto
- Cada fila: foto thumb del objeto, nombre estudiante, nombre objeto, fecha creación, status badge, botón "Ver"
- Click en fila → `/admin/claims/:id`
- Buscador: busca por nombre de estudiante o nombre de objeto
