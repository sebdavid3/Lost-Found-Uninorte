# UnauthorizedPage

**Ruta:** `/unauthorized`

**Rol:** AUTHENTICATED (cualquier rol, pero sin permiso para la ruta intentada)

---

## Función

Pantalla de acceso denegado cuando un usuario autenticado intenta acceder a una ruta para la que su rol no tiene permisos (ej: estudiante intenta `/admin`). Mensaje claro y opciones de navegación.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| CatalogPage (`/`) | "Ir al catálogo" (todos los roles) |
| AdminDashboardPage (`/admin`) | Solo si el usuario es ADMIN (no aplica aquí) |
| LoginPage (`/login`) | Si la sesión expiró durante la navegación |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `EmptyState` | UI | Variante unauthorized: icono de candado + mensaje + CTA |
| `Button` | shadcn | "Volver al inicio" |

---

## Layout

Usa el layout base sin sidebar. Layout centrado.

---

## Reglas de negocio

- Mensaje: "Acceso denegado"
- Subtítulo: "No tienes permisos para acceder a esta sección"
- CTA: "Volver al inicio"
- No mostrar esto para usuarios no autenticados (esos van a login)
- Si el rol es STUDENT e intentó `/admin`, sugerir: "Si eres administrador, inicia sesión con tu cuenta de administrador"
