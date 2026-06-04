# ObjectDetailPage

**Ruta:** `/objects/:id`

**Rol:** PUBLIC (todos pueden ver)

---

## Función

Vista detallada de un solo objeto perdido. Muestra foto grande, descripción completa, categoría, ubicación, fecha encontrado, y estado. Si el usuario es STUDENT y el objeto está AVAILABLE, muestra CTA para reclamar.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| CatalogPage (`/`) | Volver al grid desde el detalle |
| CreateClaimPage (`/objects/:id/claim`) | Click en "Reclamar este objeto" → formulario de reclamo |
| LoginPage (`/login`) | Si no autenticado e intenta reclamar → redirect a login con returnUrl |
| AdminEditObjectPage (`/admin/objects/:id/edit`) | Admin puede editar desde aquí (link si role=ADMIN) |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/objects/:id` | Obtener detalle del objeto |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `ObjectHero` | Dominio | Foto grande del objeto (radio 16px) |
| `StatusBadge` | UI | AVAILABLE (verde) / CLAIMED (ámbar) / DONATED (gris) |
| `CategoryBadge` | UI | Chip coral con nombre de categoría |
| `LocationDetail` | Dominio | Dónde se encontró / dónde reclamar |
| `DateDisplay` | UI | Fecha formateada con date-fns |
| `ClaimCTAButton` | UI | Botón "Reclamar este objeto" (visible solo si STUDENT + AVAILABLE) |
| `Button` | shadcn | Volver, editar (admin), reclamar |
| `Skeleton` | shadcn | Loading state |
| `ErrorState` | UI | Si no existe el objeto o error de red |

---

## Estados

| Estado | Visual |
|--------|--------|
| **loading** | Skeleton de foto grande + líneas de texto |
| **error** | ErrorState: "Objeto no encontrado" o "Error al cargar" + Retry |
| **success** | Foto + metadata + CTA condicional |

---

## Layout

Usa `PublicLayout`. Layout de 2 columnas en desktop: izquierda foto, derecha metadata. 1 columna en mobile (foto arriba, info abajo).

---

## Reglas de negocio

- Botón "Reclamar" visible solo si: `user.role === 'STUDENT'` Y `object.status === 'AVAILABLE'`
- Si el usuario no está autenticado, el CTA dice "Inicia sesión para reclamar" y redirige a `/login?returnUrl=/objects/:id/claim`
- Si el objeto ya fue reclamado (CLAIMED), mostrar "Ya ha sido reclamado" con badge
- Foto: radio 16px, object-fit cover, placeholder SVG inline si no hay foto
