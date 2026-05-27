# CreateClaimPage

**Ruta:** `/objects/:id/claim`

**Rol:** STUDENT (requiere autenticación)

---

## Función

Formulario para crear un reclamo sobre un objeto específico. El estudiante selecciona el tipo de evidencia y proporciona descripción + opcionalmente URL/foto. Mínimo 1 evidencia requerida. Tras submit exitoso, redirige a Mis Reclamaciones.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| ObjectDetailPage (`/objects/:id`) | Pre-carga info del objeto, breadcrumb "Volver al objeto" |
| MyClaimsPage (`/mis-reclamaciones`) | Destino post-submit exitoso |
| LoginPage (`/login`) | Si no autenticado → redirect con returnUrl |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/objects/:id` | Precargar datos del objeto para mostrar referencia |
| `POST` | `/claims` | Crear el reclamo con evidencias |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `ClaimForm` | Dominio | Formulario principal con React Hook Form + Zod |
| `EvidenceBuilder` | Dominio | Agregar/quitar filas de evidencia (type + description + url) |
| `EvidenceTypeSelect` | Dominio | Select con los tipos válidos del enum EvidenceType |
| `ObjectMiniCard` | Dominio | Card pequeña con foto + nombre del objeto que se reclama |
| `LoadingButton` | UI | Submit con spinner + disabled |
| `ConfirmModal` | UI | Modal de revisión pre-submit: muestra resumen del reclamo |
| `Card` | shadcn | Contenedor del formulario |
| `Input` / `Select` / `Textarea` | shadcn | Campos del formulario |

---

## Estados

| Estado | Visual |
|--------|--------|
| **loading** | Skeleton del formulario + mini card |
| **idle** | Formulario vacío, mini card con info del objeto, botón "Agregar evidencia" |
| **submitting** | Botón deshabilitado + spinner. Campos deshabilitados |
| **validation error** | Errores inline debajo de cada campo + toast |
| **submit error** | Toast error: "No se pudo crear el reclamo. Intenta de nuevo." |
| **submit success** | Toast "Reclamo creado exitosamente" + redirect a /mis-reclamaciones |

---

## Reglas de negocio

- Mínimo 1 evidencia (`@ArrayMinSize(1)`)
- EvidenceType debe ser uno de los valores del enum
- Description: requerido, 10-500 caracteres
- URL: opcional, formato URL válido si presente
- Si el objeto ya fue reclamado (status !== AVAILABLE), mostrar mensaje de error y bloquear submit
- No permitir crear reclamo duplicado para el mismo objeto (validar antes de submit via query o manejar error 409)
- Mostrar preview de lo que se va a enviar antes del submit (ConfirmModal con resumen)
- Deshabilitar botón "Agregar evidencia" si ya hay 5 evidencias (límite razonable)
