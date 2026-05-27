# ClaimDetailPage

**Ruta:** `/claims/:id`

**Rol:** STUDENT (solo puede ver sus propios claims)

---

## Función

Vista de solo lectura de un reclamo específico del estudiante. Muestra el objeto reclamado, las evidencias enviadas, el estado actual, y si fue rechazado, la razón. Incluye una línea de tiempo del proceso.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| MyClaimsPage (`/mis-reclamaciones`) | Volver a la lista de reclamos |
| ObjectDetailPage (`/objects/:id`) | Link al objeto reclamado |
| AdminClaimDetailPage (`/admin/claims/:id`) | El admin ve la misma info pero con acciones |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/claims/:id` | Obtener detalle del reclamo (proxy filter: solo si pertenece al usuario) |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `ClaimHeader` | Dominio | Título, fecha, status badge grande |
| `ObjectMiniCard` | Dominio | Card del objeto reclamado (link a ObjectDetailPage) |
| `EvidenceList` | Dominio | Lista de evidencias enviadas con tipo y descripción |
| `StatusBadge` | UI | Badge grande del estado actual |
| `RejectionBanner` | UI | Banner rojo con razón de rechazo (solo si REJECTED) |
| `ApprovalBanner` | UI | Banner verde con instrucciones (solo si APPROVED) |
| `Timeline` | Dominio | Línea de tiempo: Creado → En revisión → Aprobado/Rechazado |
| `Skeleton` | shadcn | Loading state |
| `ErrorState` | UI | Error al cargar |

---

## Layout

Usa `StudentLayout`. Layout de una columna con secciones verticales.

---

## Reglas de negocio

- Solo el dueño del claim puede ver esta página (validado por backend proxy + frontend guard)
- Si el claim está PENDING, mostrar "En espera de revisión por Bienestar Universitario"
- Si el claim está APPROVED, mostrar "Reclamo aprobado — puedes pasar a recoger tu objeto"
- Si el claim está REJECTED, mostrar la razón en un banner prominente
- No hay acciones disponibles (es read-only para el estudiante)
