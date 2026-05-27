# ClaimAuditPage

**Ruta:** `/admin/claims/:id/audit`

**Rol:** ADMIN

---

## Función

Reporte de auditoría completo para un reclamo específico, generado por el patrón Visitor. Muestra:
- Resumen del reclamo y evidencias
- Puntajes de similitud Jaccard por tipo de evidencia
- Score global de coincidencia
- Reporte de auditoría completo
- Estado de integridad del audit log asociado

---

## Cohesión con otras vistas

| Vista | Relación |
|-------|----------|
| AdminClaimDetailPage (`/admin/claims/:id`) | Link "Ver auditoría" desde detalle del reclamo |
| GlobalAuditLogPage (`/admin/audit-log`) | Auditoría global del sistema |

---

## API Calls

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/claims/:id` | Info base del reclamo |
| `GET` | `/claims/:id/audit` | Reporte de auditoría con scores de similitud |

---

## Componentes necesarios

| Componente | Tipo | Propósito |
|-----------|------|-----------|
| `AuditReportHeader` | Dominio | Título, ID reclamo, fecha, metadata |
| `SimilarityScoreCard` | UI | Card con score numérico grande + barra de progreso |
| `JaccardBar` | UI | Barra horizontal para cada tipo de evidencia (0-100%) |
| `EvidenceComparisonTable` | Dominio | Tabla: tipo evidencia, descripción, score, peso |
| `IntegrityBadge` | UI | Badge "Cadena de hash intacta" (verde) o "Alterada" (rojo) |
| `Skeleton` | shadcn | Loading state |
| `ErrorState` | UI | Error con retry |

---

## Layout

Usa `AdminLayout`. Layout de una columna con secciones apiladas verticalmente.

---

## Reglas de negocio

- Scores de similitud Jaccard: 0.0 a 1.0, mostrados como porcentaje
- Score global es el promedio ponderado de todos los tipos de evidencia
- Si la cadena de hash está alterada, mostrar alerta roja prominente
- Este reporte es read-only; no hay acciones disponibles
