# AdminCreateObjectPage

**Ruta:** `/admin/objects/new`

**Rol:** ADMIN

---

## Función

Formulario para registrar un nuevo objeto perdido/encontrado en el sistema. Incluye carga de foto, selección de categoría, nombre, descripción, ubicación y fecha encontrado.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| AdminObjectsListPage (`/admin/objects`) | Redirección post-creación exitosa |
| ObjectDetailPage (`/objects/:id`) | Preview del objeto creado |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `POST` | `/objects` | Crear objeto (multipart/form-data si incluye foto) |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `ObjectForm` | Dominio | Formulario completo con React Hook Form + Zod |
| `ImageUploader` | Dominio | Drop zone + preview + botón eliminar foto |
| `CategorySelect` | Dominio | Select con todas las categorías del enum |
| `LoadingButton` | UI | Submit con spinner |
| `Card` | shadcn | Contenedor del formulario |
| `Input` / `Select` / `Textarea` | shadcn | Campos del formulario |

---

## Layout

Usa `AdminLayout`. Ancho medio centrado (max-w-2xl) para el formulario.

---

## Reglas de negocio

- Nombre: requerido, 3-100 caracteres
- Descripción: requerido, 10-500 caracteres
- Categoría: requerido, selección del enum ObjectCategory
- Foto: opcional, pero si no se provee, mostrar placeholder. Regla de negocio: objetos sin foto se marcan con advertencia
- Ubicación: opcional, string libre
- Fecha encontrado: opcional, default hoy
- Estado: default AVAILABLE
- Foto debe ser menor a 5MB, formatos: jpg, png, webp
