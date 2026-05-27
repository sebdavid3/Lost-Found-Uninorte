# CatalogPage

**Ruta:** `/`

**Rol:** PUBLIC (todos pueden ver)

---

## Función

Página principal de la aplicación. Muestra un grid paginado de todos los objetos perdidos con búsqueda y filtros. Es la puerta de entrada para todos los usuarios.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| ObjectDetailPage (`/objects/:id`) | Click en ObjectCard → detalle del objeto |
| CreateClaimPage (`/objects/:id/claim`) | Desde detalle, si es STUDENT → crear reclamo |
| LoginPage (`/login`) | Si no autenticado e intenta reclamar → redirige a login |
| AdminObjectsListPage (`/admin/objects`) | Admin puede gestionar objetos desde el panel admin |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/objects?page=&limit=&category=&location=&q=` | Listar objetos con filtros y paginación |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `SearchField` | UI | Input de búsqueda con debounce (300ms) + lupa |
| `CategoryFilterChips` | Dominio | Chips de categoría (coral) para filtrar |
| `ObjectCard` | Dominio | Tarjeta de objeto: foto, nombre, categoría, fecha, ubicación |
| `Pagination` | UI | Controles Anterior/Siguiente + página actual |
| `SkeletonCard` | UI | Placeholder shimmer mientras carga (6 cards) |
| `EmptyState` | UI | "No hay objetos perdidos" cuando no hay resultados |
| `ErrorState` | UI | "Error al cargar" con botón Retry |

---

## Estados

| Estado | Visual |
|--------|--------|
| **loading** | Grid de 6 SkeletonCards |
| **empty** | EmptyState "No hay objetos perdidos registrados" |
| **error** | ErrorState con mensaje + botón "Reintentar" |
| **searching** | Grid existente se desvanece ligeramente + skeleton en cards nuevas |
| **success** | Grid de ObjectCards + Pagination |

---

## Store / Estado local

```ts
interface CatalogState {
  objects: ObjectWithStatus[];
  pagination: { page: number; limit: number; total: number };
  filters: { category?: string; location?: string; q?: string };
}
```

Usar estado local con `useState` + TanStack Query para server state. No necesita Zustand.

---

## Layout

Usa `PublicLayout`. Navbar visible con links según rol. Footer institucional.

---

## Reglas de negocio

- Búsqueda con debounce de 300ms (hook `useDebounce`)
- AbortController para cancelar request anterior si el usuario escribe más rápido
- Si hay filtros activos, mostrar indicador de filtros aplicados
- Si no hay resultados de búsqueda, mostrar "No se encontraron objetos con esos filtros" (distinto del empty state general)
- Paginación: 20 items por defecto
- Categorías: coral chips, mostrar todas y activa destacada
