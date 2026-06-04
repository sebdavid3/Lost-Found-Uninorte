# LoginPage

**Ruta:** `/login`

**Rol:** PUBLIC (GuestOnlyRoute — si ya hay sesión, redirige a home rol-based)

---

## Función

Pantalla de inicio de sesión real con email + contraseña. Autentica al usuario contra el backend, almacena el token y los datos del usuario en el store de autenticación, y redirige según el rol.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| CatalogPage (`/`) | Destino post-login para STUDENT |
| AdminDashboardPage (`/admin`) | Destino post-login para ADMIN |
| RegisterPage (`/register`) | Link "¿No tienes cuenta? Regístrate" |
| NotFoundPage | Si returnUrl es inválido, redirige a home |
| UnauthorizedPage | Si el rol no tiene acceso, muestra pantalla de error |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `POST` | `/auth/login` | Enviar email + password, recibir token + user |
| `GET` | `/auth/me` | Hidratar datos del usuario si ya hay token guardado |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `LoginForm` | Dominio | Formulario email + password con React Hook Form + Zod |
| `LoadingButton` | UI | Botón con spinner mientras se autentica |
| `ErrorState` | UI | Mostrar error de credenciales inválidas |
| `Card` | shadcn | Contenedor del formulario |
| `Input` | shadcn | Campos email y password |
| `Label` | shadcn | Labels de formulario |
| `Button` | shadcn | Botón de submit (variante near-black) |

---

## Estados

| Estado | Visual |
|--------|--------|
| **idle** | Formulario vacío, botón "Iniciar sesión" |
| **loading** | Botón deshabilitado + spinner. Campos deshabilitados |
| **error** | Toast o inline error: "Credenciales inválidas" o "Error de conexión" |
| **success** | Redirección a home rol-based + toast "Sesión iniciada" |

---

## Store

```ts
// stores/authStore.ts
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;  // GET /auth/me on app load
}
```

---

## Layout

Usa `PublicLayout`. Sin sidebar. Sin footer complejo. Tarjeta centrada en la pantalla.

---

## Reglas de negocio

- Email es requerido y debe tener formato válido
- Password es requerido, mínimo 6 caracteres
- Si ya hay sesión activa, redirigir automáticamente (no mostrar login)
- Guardar returnUrl para redirigir después del login
- En caso de error 401, mostrar "Credenciales inválidas"
- En caso de error de red, mostrar "Error de conexión. Intenta de nuevo."
