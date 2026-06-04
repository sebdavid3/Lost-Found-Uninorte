# RegisterPage

**Ruta:** `/register`

**Rol:** PUBLIC (GuestOnlyRoute)

---

## Función

Formulario de auto-registro para estudiantes. Recoge nombre, email y contraseña. Tras registro exitoso, inicia sesión automáticamente y redirige al catálogo.

> **Nota MVP:** Puede omitirse en una primera iteración si los usuarios son creados por admin o seed. Definida para completitud del sistema target.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| LoginPage (`/login`) | Link "¿Ya tienes cuenta? Inicia sesión" |
| CatalogPage (`/`) | Destino post-registro |
| AuthStore | Almacena usuario y token tras registro |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `POST` | `/auth/register` | Crear cuenta + auto-login |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `RegisterForm` | Dominio | Formulario con nombre, email, password, confirmar password |
| `LoadingButton` | UI | Submit con spinner |
| `Card` | shadcn | Contenedor |
| `Input` | shadcn | Campos del formulario |

---

## Layout

Usa `PublicLayout`. Misma estructura que LoginPage: tarjeta centrada.

---

## Reglas de negocio

- Nombre: requerido, 3-100 caracteres
- Email: requerido, formato email, dominio `@uninorte.edu.co` (opcional para MVP)
- Password: requerido, mínimo 6 caracteres
- Confirmar password: debe coincidir con password
- Tras registro exitoso, auto-login y redirección a home
