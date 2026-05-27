# AdminObjectsListPage

**Ruta:** `/admin/objects`

**Rol:** ADMIN

---

## Función

Inventario completo de objetos perdidos. Tabla o grid con búsqueda, filtros por categoría y estado, paginación. Acciones: crear nuevo, editar, eliminar. Es el CRM de objetos del sistema.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| AdminCreateObjectPage (`/admin/objects/new`) | Botón "Nuevo objeto" → formulario de creación |
| AdminEditObjectPage (`/admin/objects/:id/edit`) | Click en editar → formulario pre-cargado |
| ObjectDetailPage (`/objects/:id`) | Click en ver → detalle público |
| AdminDashboardPage (`/admin`) | Volver al dashboard |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/objects?page=&limit=&category=&status=&q=` | Listar con filtros |
| `DELETE` | `/objects/:id` | Eliminar objeto (con confirmación) |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `SearchField` | UI | Búsqueda por nombre/descripción |
| `FilterBar` | UI | Filtros: categoría (select), estado (AVAILABLE/CLAIMED/DONATED) |
| `ObjectsTable` | Dominio | Tabla: foto thumb, nombre, categoría, fecha, estado, acciones |
| `Pagination` | UI | Controles de paginación |
| `ConfirmModal` | UI | Confirmación antes de eliminar |
| `Button` | shadcn | "Nuevo objeto", editar, eliminar |
| `Skeleton` | shadcn | Loading state (filas de tabla) |
| `EmptyState` | UI | "No hay objetos registrados" |
| `ErrorState` | UI | Error con retry |
| `Badge` | shadcn | Estado del objeto, categoría |

---

## Layout

Usa `AdminLayout`. Sidebar con "Objetos" activo.

---

## Reglas de negocio

- Confirmación obligatoria antes de eliminar objeto (ConfirmModal)
- Al eliminar, mostrar toast success/error
- Si el objeto tiene claims asociados, mostrar advertencia antes de eliminar
- Paginación: 20 items por defecto
- Botón "Nuevo objeto" prominente (near-black pill)
