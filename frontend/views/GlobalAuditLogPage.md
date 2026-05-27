# GlobalAuditLogPage

**Ruta:** `/admin/audit-log`

**Rol:** ADMIN

---

## Función

Bitácora global de auditoría inmutable con cadena de hash SHA-256. Muestra todas las acciones del sistema en una tabla paginada con filtros por actor, tipo de acción y entidad. Permite ejecutar verificación de integridad de la cadena completa.

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| AdminClaimDetailPage (`/admin/claims/:id`) | Auditoría específica de un reclamo |
| AdminClaimsListPage (`/admin/claims`) | Acciones auditables desde claims |
| AdminDashboardPage (`/admin`) | Link desde sidebar |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/audit-log?page=&limit=&action=&actorId=&entityId=` | Listar entradas de auditoría |
| `GET` | `/audit-log/verify-integrity` | Verificar cadena de hash completa |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `AuditLogTable` | Dominio | Tabla: timestamp, actor, acción, entidad, detalles, hash |
| `ActionFilter` | UI | Filtro por tipo de acción (CREATE, UPDATE, VERIFY, APPROVE, REJECT) |
| `IntegrityChecker` | UI | Botón "Verificar integridad" + resultado banner |
| `Pagination` | UI | Controles de paginación |
| `Skeleton` | shadcn | Loading state |
| `EmptyState` | UI | "No hay entradas de auditoría" |
| `ErrorState` | UI | Error con retry |
| `Badge` | shadcn | Tipo de acción |

---

## Layout

Usa `AdminLayout`. Tabla ancha con scroll horizontal (muestra hash truncado + tooltip con hash completo).

---

## Reglas de negocio

- Tabla paginada, 20 items por defecto
- Cada fila: timestamp formateado, email del actor, acción como badge, tipo de entidad, ID de entidad, hash truncado
- El hash completo se muestra en tooltip al hover
- Botón "Verificar integridad": ejecuta GET /audit-log/verify-integrity
  - Éxito: banner verde "✅ Cadena de integridad verificada — todas las entradas son auténticas"
  - Fracaso: banner rojo "❌ Se detectaron inconsistencias en la cadena de hash"
- Filtros: por acción (dropdown), por actor (input email), por entidad (input ID)
- Las entradas son read-only; no hay acciones de edición/eliminación
