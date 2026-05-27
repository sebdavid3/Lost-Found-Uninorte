# NotFoundPage

**Ruta:** `*` (catch-all)

**Rol:** PUBLIC

---

## Función

Página de error 404 para rutas no existentes. Mensaje claro, ilustración minimalista, botón para volver al inicio.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| CatalogPage (`/`) | Botón "Volver al inicio" → `/` |
| LoginPage (`/login`) | Link "Ir al inicio de sesión" si no autenticado |

---

## API Calls

Ninguna.

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `EmptyState` | UI | Variante not-found: ilustración 404 + mensaje + CTA |
| `Button` | shadcn | Botón "Volver al inicio" |

---

## Layout

Usa `PublicLayout`. Layout centrado, sin sidebar.

---

## Reglas de negocio

- Mensaje: "Página no encontrada"
- Subtítulo: "La ruta a la que intentas acceder no existe o ha sido movida"
- CTA: "Volver al inicio"
- Si el usuario está autenticado, redirigir a su home rol-based en vez del público
- No loguear como error (no es un bug del sistema)
