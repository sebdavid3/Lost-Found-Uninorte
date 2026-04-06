# 6.6 Diagramas obligatorios

Estado: NO INICIADO
Responsable: TBD
Fecha de actualizacion: 2026-04-05

## 1) Modelo C4

### C4 - Contexto
- Estado: NO INICIADO
- Enlace: TBD

### C4 - Contenedores
- Estado: NO INICIADO
- Enlace: TBD

Notas (consistencia con implementacion actual):

- Contenedores backend: `claims-service` y `audit-service`.
- Infraestructura: `rabbitmq`, `db` (PostgreSQL), `audit-db` (PostgreSQL).
- Soporte para Service Discovery (implementado en codigo): Consul como registry (pendiente de reflejarse en `docker-compose.yml` si la demo se corre local).

### C4 - Componentes
- Estado: NO INICIADO
- Enlace: TBD

Componentes relevantes (para no contradecir el codigo):

- `claims-service`: modulo de Service Discovery (`ServiceDiscoveryModule` + `ServiceDiscoveryService`) y endpoints `GET /health` y `GET /registry/:serviceName`.
- `claims-service`: interceptor de Audit Log (emision de eventos hacia RabbitMQ).

## 2) Diagrama de base de datos

- Estado: NO INICIADO
- Enlace/archivo: TBD
- Debe cubrir al menos:
  - `claims-service` (User, Object, Claim, Evidence)
  - `audit-service` (AuditLog)

## 3) Prototipos en Figma

- Estado: NO INICIADO
- Enlace Figma: TBD
- Pantallas minimas sugeridas:
  - Catalogo de objetos
  - Formulario de reclamacion
  - Panel administrativo
  - Vista de detalles/auditoria

## Regla de consistencia

Ningun diagrama puede contradecir la implementacion real de `docker-compose.yml` y de los modulos en `services/`.

Adicional: si en diagramas se incluye Consul como registry, el despliegue debe incluirlo (en compose o como servicio externo) para que la evidencia sea ejecutable.

## Checklist de cierre
- [ ] C4 Contexto, Contenedores y Componentes listos.
- [ ] Diagrama de BD actualizado a esquema actual.
- [ ] Figma enlazado y navegable.
- [ ] Consistencia verificada contra codigo.
