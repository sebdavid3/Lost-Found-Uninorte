# MyClaimsPage

**Ruta:** `/mis-reclamaciones`

**Rol:** STUDENT (requiere autenticación)

---

## Función

Lista paginada de todos los reclamos del estudiante autenticado. Cada reclamo muestra el objeto asociado, fecha, estado (PENDING/APPROVED/REJECTED), y razón de rechazo si aplica. Es el centro de seguimiento del estudiante.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| ClaimDetailPage (`/claims/:id`) | Click en un reclamo → detalle completo |
| CreateClaimPage (`/objects/:id/claim`) | Redirección aquí después de crear un reclamo exitoso |
| CatalogPage (`/`) | Si no hay reclamos, CTA "Buscar objetos para reclamar" |
| LoginPage (`/login`) | Si no autenticado, guard → redirect con returnUrl |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/claims/my?page=&limit=` | Listar claims del estudiante (headers: x-user-id) |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `ClaimCard` | Dominio | Tarjeta: foto objeto, nombre, fecha, status badge, razón si REJECTED |
| `ClaimStatusBadge` | UI | Badge PENDING (ámbar) / APPROVED (verde) / REJECTED (rojo) |
| `Pagination` | UI | Controles de paginación |
| `SkeletonCard` | UI | Loading state (3-4 cards) |
| `EmptyState` | UI | "No has realizado ningún reclamo" + CTA "Ir al catálogo" |
| `ErrorState` | UI | "Error al cargar tus reclamos" + Retry |

---

## Layout

Usa `StudentLayout`. Navbar con links: Catálogo | Mis Reclamaciones (activo) | User menu.

---

## Reglas de negocio

- Si no hay claims, mostrar EmptyState con CTA a CatalogPage
- Paginación: 10 items por defecto
- Reclamos ordenados por fecha descendente (más reciente primero)
- Si un reclamo fue rechazado, mostrar la razón en un banner dentro de la tarjeta
- Si un reclamo está APPROVED, mostrar mensaje "Puedes reclamar tu objeto en Bienestar Universitario"
