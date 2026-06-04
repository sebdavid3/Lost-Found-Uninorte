# AdminEditObjectPage

**Ruta:** `/admin/objects/:id/edit`

**Rol:** ADMIN

---

## Función

Formulario pre-cargado con los datos del objeto para actualizar su información. Permite cambiar foto, nombre, descripción, categoría, ubicación, estado (AVAILABLE/CLAIMED/DONATED).

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| AdminObjectsListPage (`/admin/objects`) | Redirección post-actualización |
| ObjectDetailPage (`/objects/:id`) | Preview del objeto actualizado |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/objects/:id` | Precargar datos actuales del objeto |
| `PATCH` | `/objects/:id` | Actualizar objeto |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `ObjectForm` | Dominio | Mismo formulario que Create, pre-cargado |
| `ImageUploader` | Dominio | Foto actual + opción de reemplazar/quitar |
| `StatusSelect` | Dominio | Select para cambiar estado (AVAILABLE/CLAIMED/DONATED) |
| `LoadingButton` | UI | Submit con spinner |
| `ConfirmModal` | UI | Confirmación si se cambia estado a DONATED |

---

## Layout

Usa `AdminLayout`. Misma estructura que Create.

---

## Reglas de negocio

- Todos los campos vienen pre-cargados desde GET /objects/:id
- Si se cambia el estado a DONATED, mostrar confirmación: "¿Estás seguro? El objeto será marcado como donado y no estará disponible para reclamos."
- Si se reemplaza la foto, eliminar la anterior del servidor
- Al guardar, mostrar toast success y redirect a /admin/objects
