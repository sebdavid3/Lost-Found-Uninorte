# AdminDashboardPage

**Ruta:** `/admin`

**Rol:** ADMIN (requiere autenticación + role)

---

## Función

Panel de control principal del admin. Muestra tarjetas de resumen con estadísticas, actividad reciente, y accesos rápidos a las secciones principales. Es el landing page post-login para administradores.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| AdminClaimsListPage (`/admin/claims`) | Quick action "Ver reclamos pendientes" |
| AdminObjectsListPage (`/admin/objects`) | Quick action "Registrar objeto" |
| GlobalAuditLogPage (`/admin/audit-log`) | Link desde sidebar |
| LoginPage (`/login`) | Si no autenticado → redirect |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/admin/stats` | Resumen: total claims, pending, approved, rejected, objects |
| `GET` | `/admin/recent-activity` | Últimas acciones en el sistema |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `StatsCard` | UI | Tarjeta con número grande + label + icono (×5) |
| `ActivityFeed` | Dominio | Lista de acciones recientes con timestamp |
| `QuickActionCard` | UI | Card con icono + label + link a sección |
| `Skeleton` | shadcn | Loading state para stats y activity |
| `ErrorState` | UI | Error al cargar stats o actividad |
| `Card` | shadcn | Contenedores del dashboard |

---

## Layout

Usa `AdminLayout`. Sidebar visible con Dashboard activo. Top bar minimal.

---

## Reglas de negocio

- Stats cards: Total Reclamos | Pendientes | Aprobados | Rechazados | Objetos Registrados
- Cada stat card es clickeable y lleva a la lista filtrada (ej: click en "Pendientes" → `/admin/claims?status=PENDING`)
- Recent activity: lista de últimas 10 acciones con formato "Juan Pérez creó un reclamo para Laptop HP — hace 5 min"
- Quick actions: "Revisar reclamos pendientes", "Registrar nuevo objeto", "Ver auditoría"
