# Frontend — Funcionalidades Faltantes para el Nuevo Frontend

> **Proyecto:** Lost & Found Uninorte
> **Branch:** `entrega-final`
> **Propósito:** Funcionalidades que **no existían en el frontend anterior** y hay que implementar desde cero en la reconstrucción.
> **Referencia de diseño:** `docs/design.md`

---

## Stack tecnológico propuesto para el nuevo frontend

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | React 19 + TypeScript | Ya definido en el proyecto |
| Build | Vite 7.3 | Ya definido |
| Estilos | Tailwind CSS 4 + design tokens | El `design.md` usa un sistema de tokens (colores, radios, tipografía) que mapea naturalmente a Tailwind |
| Routing | React Router 7 | Ya definido |
| Estado global | React Context + useReducer | Suficiente para MVP; sin sobrecarga de Redux/Zustand |
| Formularios | React Hook Form + Zod | Validación declarativa con tipos inferidos |
| API client | fetch wrapper tipado (similar al anterior pero corregido) | Simple, sin dependencia extra |
| Notificaciones | react-hot-toast o sonner | Sistema de toasts no intrusivo |
| Testing | Vitest + React Testing Library | Liviano, compatible con Vite |
| Iconos | Lucide React (ya existe en el proyecto) | Consistente con lo anterior |

---

## NF1. Sistema de autenticación (AuthContext)

**Estado anterior:** No existía. El rol se simulaba con un toggle en el admin panel y headers HTTP puestos desde el cliente.

**Lo que hay que implementar:**

```tsx
// context/AuthContext.tsx

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

**Pantallas:**
- `/login` — formulario de login (select user simulado o email/password)
- Al cargar la app, verificar si hay sesión activa
- Proteger rutas: `/admin` solo accesible si `role === 'ADMIN'`

**Headers:** El AuthContext debe proveer los headers `x-user-id` y `x-user-role` que el API client usará en cada request.

**Archivos a crear:**
- `src/context/AuthContext.tsx`
- `src/context/AuthProvider.tsx`
- `src/pages/LoginPage.tsx`
- `src/components/ProtectedRoute.tsx`

---

## NF2. Página "Mis Reclamaciones" para estudiantes

**Estado anterior:** No existía. El estudiante creaba un reclamo y nunca sabía qué pasaba.

**Lo que hay que implementar:**
- Ruta: `/mis-reclamaciones`
- Lista de claims del usuario autenticado con estado (PENDING, APPROVED, REJECTED)
- Endpoint: `GET /claims/my?page=1&limit=20` (headers: x-user-id, x-user-role)
- Cada claim muestra: objeto, fecha, estado, y si fue rechazado, la razón

**Archivos a crear:**
- `src/pages/MyClaimsPage.tsx`
- `src/components/ClaimStatusBadge.tsx`
- `src/components/ClaimCard.tsx`

---

## NF3. Estados de carga (loading) en toda la app

**Estado anterior:** Solo un `<p>` de texto en AdminPanelPage, sin spinners ni skeletons.

**Lo que hay que implementar:**

| Componente | Estado loading |
|-----------|---------------|
| Gallery / lista de objetos | Skeleton cards (3-6 placeholders con animación) |
| Tabla de claims en admin | Skeleton rows |
| Botón "Enviar Reclamación" | Spinner + disabled |
| Botones Approve/Reject | Spinner + disabled |
| Página de login | Spinner en botón |
| Modal de detalle de claim | Skeleton mientras carga |
| Página "Mis Reclamaciones" | Skeleton list |

**Archivos a crear:**
- `src/components/ui/Skeleton.tsx` — componente reutilizable de skeleton
- `src/components/ui/Spinner.tsx` — spinner SVG simple
- `src/components/ui/LoadingButton.tsx` — botón con estado loading

---

## NF4. Estados de error con retry

**Estado anterior:** Errores solo en `console.error`, indistinguibles del estado vacío.

**Lo que hay que implementar:**

```tsx
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}
```

**Comportamiento:**
- Cuando un fetch falla, mostrar componente de error con:
  - Icono de error
  - Mensaje descriptivo ("No se pudieron cargar los objetos. Verifica tu conexión.")
  - Botón "Reintentar"
- Distinto visualmente del estado vacío:

| Estado | Visual |
|--------|--------|
| Vacío | "No hay objetos perdidos registrados" + icono de caja vacía |
| Error | "Error al cargar" + icono de advertencia/error + botón Retry |
| Cargando | Skeleton/spinner |

**Archivos a crear:**
- `src/components/ui/ErrorState.tsx`
- `src/components/ui/EmptyState.tsx`
- Custom hook: `src/hooks/useApi.ts` — maneja loading/error/data automáticamente

---

## NF5. Sistema de notificaciones (toasts)

**Estado anterior:** `alert()` usado en 4 lugares.

**Lo que hay que implementar:**
- Toast en esquina superior derecha
- Tipos: success (verde), error (rojo), info (azul), warning (amarillo)
- Auto-dismiss después de 4 segundos (excepto error que requiere clic)
- Cola de toasts si múltiples notificaciones simultáneas

**Dependencia:** `react-hot-toast` o `sonner`

**Archivos a crear:**
- `src/components/ui/Toaster.tsx` — wrapper/ provider de notificaciones

---

## NF6. Confirmación antes de acciones destructivas

**Estado anterior:** Approve/Reject se ejecutaban inmediatamente sin preguntar.

**Lo que hay que implementar:**
- Modal de confirmación antes de:
  - Aprobar reclamo → "¿Estás seguro de aprobar este reclamo?"
  - Rechazar reclamo → modal con campo de razón obligatorio + confirmación
  - Eliminar reclamo → "¿Estás seguro de eliminar este reclamo?"
- Botón "Cancelar" y botón "Confirmar" en el modal

**Archivos a crear:**
- `src/components/ui/ConfirmModal.tsx`

---

## NF7. Paginación en listas

**Estado anterior:** Todos los objetos y claims se cargaban de una sola vez.

**Lo que hay que implementar:**
- Parámetros `page` y `limit` en llamadas API
- Controles de paginación en:
  - Catálogo de objetos (`/`)
  - Admin claims table (`/admin`)
  - Mis reclamaciones (`/mis-reclamaciones`)
- Mostrar: "Mostrando 1-20 de 45 resultados" + botones Anterior/Siguiente
- Navegación por número de página (opcional para MVP)

**Archivos a crear:**
- `src/components/ui/Pagination.tsx`

---

## NF8. Ruta 404 (Not Found)

**Estado anterior:** No existía ruta catch-all. Navegar a `/ruta-inexistente` mostraba una página en blanco.

**Lo que hay que implementar:**
- Ruta `*` en React Router que renderice componente NotFound
- Mensaje: "Página no encontrada"
- Botón: "Volver al inicio"

**Archivos a crear:**
- `src/pages/NotFoundPage.tsx`

---

## NF9. Búsqueda con debounce

**Estado anterior:** El input de búsqueda en CatalogPage filtraba en cada keystroke.

**Lo que hay que implementar:**
- Debounce de 300ms antes de disparar la búsqueda
- Indicador visual de que se está buscando (opcional)
- Cancelar request anterior si el usuario escribe más rápido (AbortController)

**Archivos a crear:**
- `src/hooks/useDebounce.ts`

---

## NF10. Formularios con validación robusta

**Estado anterior:** Solo se verificaba `evidenceData.length === 0`. Sin validación por campo.

**Lo que hay que implementar:**
- Usar React Hook Form + Zod para validación declarativa
- Validaciones:

| Campo | Reglas |
|-------|--------|
| `objectId` | Requerido, UUID válido |
| `evidences` | Array mínimo 1 elemento |
| `evidence.type` | Solo valores del enum `EvidenceType` |
| `evidence.description` | Requerido, 10-500 caracteres |
| `evidence.url` | Opcional, URL válida si presente |
| `rejectionReason` | Requerido cuando status = REJECTED, máx 500 caracteres |

- Mostrar errores de validación inline debajo de cada campo
- Deshabilitar submit si hay errores

**Archivos a crear:**
- `src/schemas/claim.schema.ts` — esquemas Zod
- Actualizar componentes de formulario para usar React Hook Form

---

## NF11. Cerrar modales con Escape y click outside

**Estado anterior:** Los modales no respondían a Escape ni a click en backdrop.

**Lo que hay que implementar:**
- Todos los modales deben:
  - Cerrar con tecla Escape
  - Cerrar al hacer click fuera del modal (en el backdrop)
  - Tener foco atrapado (focus trap) para accesibilidad
  - Animación de entrada/salida (fade + scale)

**Archivos a crear:**
- `src/components/ui/Modal.tsx` — modal reusable con estos comportamientos

---

## NF12. Diseño responsive completo

**Estado anterior:** No se analizó responsive, pero el nuevo frontend debe ser mobile-first.

**Lo que hay que implementar:**
- Basado en el `design.md`:
  - Breakpoints: <425px, 425-640px, 640-768px, 768-1024px, 1024-1440px, 1440-2560px
  - Nav colapsable a menú hamburguesa en mobile
  - Cards en 3 columnas desktop → 2 tablet → 1 mobile
  - Formularios en filas de 2 columnas desktop → 1 columna mobile
  - Tablas con scroll horizontal en mobile o convertir a cards

---

## Resumen de archivos a crear

| Feature | Archivos |
|---------|----------|
| AuthContext | `src/context/AuthContext.tsx`, `AuthProvider.tsx`, `pages/LoginPage.tsx`, `components/ProtectedRoute.tsx` |
| Mis Reclamaciones | `pages/MyClaimsPage.tsx`, `components/ClaimStatusBadge.tsx`, `components/ClaimCard.tsx` |
| Loading states | `components/ui/Skeleton.tsx`, `Spinner.tsx`, `LoadingButton.tsx` |
| Error states | `components/ui/ErrorState.tsx`, `EmptyState.tsx`, `hooks/useApi.ts` |
| Toasts | `components/ui/Toaster.tsx` |
| Confirm modal | `components/ui/ConfirmModal.tsx` |
| Pagination | `components/ui/Pagination.tsx` |
| 404 page | `pages/NotFoundPage.tsx` |
| Debounce | `hooks/useDebounce.ts` |
| Form validation | `schemas/claim.schema.ts` |
| Modal reusable | `components/ui/Modal.tsx` |
| Design system tokens | Tailwind config con colores, radios, tipografía del `design.md` |

---

## Checklist de verificación post-implementación

- [ ] Login funciona y AuthContext provee userId/role a toda la app
- [ ] `/admin` solo accesible para ADMIN (redirige si no)
- [ ] Catálogo de objetos con paginación, búsqueda con debounce, y skeleton loading
- [ ] Crear claim con validación de formulario y feedback visual
- [ ] "Mis Reclamaciones" muestra claims del usuario con estados
- [ ] Admin puede ver todos los claims con paginación
- [ ] Approve/Reject con confirmación + loading + toast de resultado
- [ ] Errores de red muestran componente de error con botón Retry
- [ ] Modales cierran con Escape, click outside, y tienen animación
- [ ] Rutas protegidas redirigen a login si no hay sesión
- [ ] Ruta 404 para cualquier URL no definida
- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] Tests unitarios para componentes críticos (Vitest + RTL)
