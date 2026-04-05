# 6.3 Requerimientos

Estado: LISTO PARA REVISION
Responsable: TBD
Fecha de actualizacion: 2026-04-05

## Requerimientos funcionales (minimo 10)

| ID | Requerimiento funcional |
| :--- | :--- |
| RF-01 | El sistema debe permitir registrar objetos encontrados con descripcion, categoria, ubicacion, fecha y fotografia. |
| RF-02 | El sistema debe generar un ID unico por objeto para relacionar registro digital y ubicacion fisica. |
| RF-03 | El sistema debe listar objetos con filtros por categoria, estado y rango de fechas. |
| RF-04 | El sistema debe permitir crear reclamaciones asociadas a un objeto registrado. |
| RF-05 | El sistema debe validar evidencias de reclamacion segun categoria del objeto (reglas de negocio). |
| RF-06 | El sistema debe permitir que administradores verifiquen reclamaciones y las aprueben o rechacen con motivo. |
| RF-07 | El sistema debe restringir operaciones administrativas mediante rol de usuario (ADMIN/STUDENT). |
| RF-08 | El sistema debe orquestar el flujo de reclamacion como proceso distribuido con pasos definidos y acciones de compensacion ante fallos (Saga). |
| RF-09 | El sistema debe resolver servicios internos por identificador logico, evitando dependencias de direccion fija (Service Discovery). |
| RF-10 | El sistema debe persistir eventos de dominio en una Outbox transaccional y publicarlos al broker sin perder consistencia con la base de datos (Outbox Pattern). |
| RF-11 | El sistema debe traducir contratos de sistemas externos a modelos internos del dominio mediante una capa de adaptacion (Anti-Corruption Layer). |
| RF-12 | El sistema debe registrar eventos de auditoria de acciones criticas de forma asincrona (Audit Log). |
| RF-13 | El sistema debe exponer consulta de historial de auditoria por entidad, actor, accion y rango de fechas (Audit Log). |
| RF-14 | El sistema debe verificar la integridad de la cadena de auditoria y reportar si existe ruptura (Audit Log). |

## Requerimientos no funcionales medibles (minimo 5)

| ID | Requerimiento no funcional | Metrica | Criterio de aceptacion |
| :--- | :--- | :--- | :--- |
| RNF-01 | Disponibilidad del entorno MVP | Porcentaje de uptime mensual | >= 99.0% en horario operativo definido |
| RNF-02 | Tiempo de respuesta API (lectura) | p95 en endpoints GET principales | <= 800 ms en ambiente de prueba |
| RNF-03 | Seguridad de acceso administrativo | Porcentaje de endpoints protegidos por validacion de rol | 100% de endpoints administrativos con control de rol |
| RNF-04 | Trazabilidad de eventos criticos | Cobertura de acciones criticas auditadas | >= 90% de acciones criticas generan evento en audit log |
| RNF-05 | Integridad de auditoria | Resultado de verificacion de cadena hash | `GET /audit-log/verify-integrity` retorna `isValid=true` en estado normal |

## Notas de trazabilidad

- RF-04 a RF-07 se trazan principalmente a `claims-service`.
- RF-08 corresponde a Saga (orquestacion distribuida del flujo).
- RF-09 corresponde a Service Discovery (resolucion dinamica de servicios).
- RF-10 corresponde a Outbox Pattern (consistencia BD + eventos).
- RF-11 corresponde a Anti-Corruption Layer (adaptacion de contratos externos).
- RF-12 a RF-14 y RNF-05 se trazan principalmente a `audit-service` (Audit Log).
- RNF-02 y RNF-04 requieren medicion formal con pruebas de carga/monitoreo para cierre definitivo.

## Matriz patron -> requerimientos que lo justifican

| Patron | Requerimientos asociados |
| :--- | :--- |
| Saga | RF-08 |
| Service Discovery | RF-09 |
| Outbox Pattern | RF-10 |
| Anti-Corruption Layer | RF-11 |
| Audit Log | RF-12, RF-13, RF-14, RNF-04, RNF-05 |

## Checklist de cierre
- [x] 10 RF definidos y verificables.
- [x] 5 RNF medibles con metrica cuantificable.
- [x] Cada requisito tiene criterio de aceptacion.
- [x] Requisitos trazables con arquitectura y modulos existentes.
