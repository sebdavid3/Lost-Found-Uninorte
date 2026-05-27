# AdminClaimDetailPage

**Ruta:** `/admin/claims/:id`

**Rol:** ADMIN

---

## Función

El "escritorio de revisión" del admin. Muestra toda la información del reclamo lado a lado: datos del objeto vs evidencias del estudiante. Proporciona las acciones críticas: Ejecutar verificación (CoR), Aprobar, Rechazar (con razón obligatoria). Es la vista más importante del sistema.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| AdminClaimsListPage (`/admin/claims`) | Volver a la lista |
| ClaimAuditPage (`/admin/claims/:id/audit`) | Link "Ver auditoría completa" |
| ClaimDetailPage (`/claims/:id`) | El estudiante ve versión read-only |
| AdminDashboardPage (`/admin`) | Breadcrumb navegación |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/claims/:id` | Obtener detalle del reclamo con objeto + evidencias |
| `POST` | `/claims/:id/verify` | Ejecutar Chain of Responsibility (Identity → Availability → EvidenceMatch) |
| `PATCH` | `/claims/:id` | Actualizar status (approve/reject manual) + rejectionReason |
| `GET` | `/claims/:id/audit` | Obtener reporte de auditoría (Visitor pattern) |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `ClaimDetailHeader` | Dominio | Info general: ID, estudiante, fecha, status badge grande |
| `ObjectReviewPanel` | Dominio | Panel izquierdo: foto objeto, nombre, descripción, estado |
| `EvidenceReviewer` | Dominio | Panel derecho: lista de evidencias con detalles |
| `CoRResultPanel` | Dominio | Resultado de verificación: handlers ejecutados, cuál falló, por qué |
| `VerifyButton` | UI | Botón "Ejecutar verificación" (near-black pill) |
| `ApproveButton` | UI | Botón "Aprobar" (verde) |
| `RejectButton` | UI | Botón "Rechazar" (rojo) — abre ConfirmModal con campo de razón |
| `ConfirmModal` | UI | Modal para confirmar rechazo con campo de texto obligatorio |
| `AuditLink` | UI | Link "Ver auditoría completa" → /admin/claims/:id/audit |
| `Skeleton` | shadcn | Loading state |
| `ErrorState` | UI | Error al cargar |
| `Toast` | Sonner | Feedback de acciones |

---

## Layout

Usa `AdminLayout`. Layout de 2 columnas en desktop:
- **Izquierda (60%):** info del objeto + evidencias
- **Derecha (40%):** panel de acciones + resultado de verificación

---

## Flujo de acciones

```
1. Admin abre la página
2. Revisa objeto vs evidencias
3. Opción A: Click "Ejecutar verificación"
   → POST /claims/:id/verify
   → CoRResultPanel muestra resultado:
      - Éxito: "Verificación superada" → botón "Aprobar" habilitado
      - Fracaso: "Fallo en [handler]: [razón]" → botón "Rechazar" con razón pre-llenada
4. Opción B: Click "Aprobar"
   → ConfirmModal: "¿Aprobar reclamo de [estudiante] para [objeto]?"
   → PATCH status=APPROVED
   → Toast success + status badge se actualiza
5. Opción C: Click "Rechazar"
   → ConfirmModal con campo "Razón de rechazo" (obligatorio, min 10 chars)
   → PATCH status=REJECTED + rejectionReason
   → Toast + status badge se actualiza
```

---

## Reglas de negocio

- No se puede aprobar/rechazar un reclamo que ya no está PENDING
- Si ya fue verificado (CoR), mostrar resultado persistido
- Razón de rechazo: requerida, mínimo 10 caracteres
- Al aprobar, el objeto asociado pasa a estado CLAIMED
- Al rechazar, el objeto vuelve a AVAILABLE (si no hay otros claims aprobados)
- Mostrar advertencia si el objeto tiene múltiples claims PENDING
