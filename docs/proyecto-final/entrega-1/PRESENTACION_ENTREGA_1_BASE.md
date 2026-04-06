---
marp: true
theme: default
paginate: true
backgroundColor: #fff
size: 16:9
style: |
  section {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 28px;
    padding: 40px 60px;
  }
  section.lead h1 { font-size: 2.2em; }
  h1 { color: #1a5276; font-size: 1.4em; }
  h2 { color: #2c3e50; font-size: 1.15em; }
  h3 { color: #2980b9; font-size: 1em; }
  pre { font-size: 0.65em; border-radius: 8px; line-height: 1.35; }
  code { background: #f0f3f5; border-radius: 4px; font-size: 0.9em; }
  table { font-size: 0.78em; }
  th { background: #eaf2f8; }
  blockquote { border-left: 4px solid #2980b9; padding: 0.3rem 1rem; font-size: 0.9em; background: #f7fbff; }
  ul, ol { font-size: 0.92em; }
  section.small-code pre { font-size: 0.58em; }
  section.smaller pre { font-size: 0.52em; }
  section.compact { font-size: 25px; }
  section.compact pre { font-size: 0.6em; }
---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _backgroundColor: #1a5276 -->
<!-- _color: white -->

# Lost & Found Uninorte

## Entrega 1 - Analisis y Diseno Arquitectonico

**Diseno de Software II**
Abril 2026

---

# Agenda

1. Problema y solucion propuesta
2. Estilo arquitectonico principal
3. Patrones arquitectonicos asignados
4. Desarrollo de patrones implementados: Audit Log + Service Discovery
5. Diagramas y responsabilidades por integrante
6. Cierre y plan de completitud

---

# Integrantes y Patrones Asignados

| Estudiante | Patron | Estado actual |
| :--- | :--- | :--- |
| Andres Carrero | Saga | En diseno |
| Sebastian Ibanez | Audit Log | Implementado |
| Ayen Henriquez | Service Discovery | Implementado (claims-service) |
| Luis Robles | Outbox Pattern | En diseno |
| Andres Serrano | Anti-Corruption Layer | En diseno |

---

# Contexto del Problema

El proceso actual de objetos perdidos es manual y desarticulado:

- Busqueda ineficiente en carpetas.
- Informacion incompleta en registros.
- Sin trazabilidad de extremo a extremo.
- Validacion presencial sin filtros previos.

Impacto:

- Alta carga operativa para Bienestar.
- Baja experiencia de usuario.
- Poco soporte para decisiones con datos.

---

# Solucion Propuesta (MVP)

- Catalogo digital con filtros por categoria, ubicacion y fecha.
- Registro de objetos con foto, ficha tecnica e ID unico.
- Reclamacion digital con evidencias de propiedad.
- Panel administrativo para validacion, cierre y estadisticas.

---

<!-- _class: compact -->

# Estilo Arquitectonico Principal

## Microservicios + Clean Architecture por servicio

```text
Frontend
   |
API Gateway logical (futuro)
   |
claims-service  <->  broker (RabbitMQ)  <->  audit-service
          |
 service registry (Consul)*
   |                                         |
claims-db                                  audit-db
```

\* Consul ya se usa en el codigo para Service Discovery. Para demo local reproducible debe estar disponible (agregar a compose o usar Consul externo).

Justificacion:

- Separar responsabilidades por contexto.
- Permitir evolucion independiente por patron.
- Reducir acoplamiento y mejorar resiliencia.

---

# Patrones Arquitectonicos (Vista General)

| Patron | Problema que resuelve | Componente objetivo |
| :--- | :--- | :--- |
| Saga | Coordinacion distribuida del flujo | Orquestador de procesos |
| Audit Log | Trazabilidad inmutable | audit-service |
| Service Discovery | Resolucion dinamica de servicios | Consul + modulo `service-discovery` en claims-service |
| Outbox | Consistencia BD-eventos | Componente outbox |
| ACL | Aislar contratos externos | Adaptadores de frontera |

---

<!-- _backgroundColor: #d35400 -->
<!-- _color: white -->
<!-- _class: lead -->

# Patron Implementado

## Audit Log
### Trazabilidad inmutable y verificable

**Integrante: Sebastian Ibanez**

---

# Audit Log - Problema Especifico

Necesidad:

- Registrar quien hizo que accion, cuando, desde donde y con que resultado.
- Evitar manipulación silenciosa de auditorias.
- No bloquear el flujo principal de reclamaciones.

Riesgos sin este patron:

- Falta de evidencia ante incidentes.
- Dificultad de investigacion y compliance.
- Acoplamiento fuerte entre negocio y logging.

---

# Audit Log - Diseno de Solucion

Elementos clave:

- Emision de eventos en `claims-service` via interceptor y decorador.
- Consumo asincrono en `audit-service` por RabbitMQ.
- Persistencia en base dedicada (`audit-db`).
- Encadenamiento criptografico por `previousHash` y `hash`.
- Endpoint de verificacion de integridad.

---

<!-- _class: compact -->

# Audit Log - Flujo End to End

```text
Controller claims (decorado)
        |
AuditLogInterceptor
        |
emit('audit.event.created')
        |
RabbitMQ queue: audit_events_queue
        |
AuditEventConsumer
        |
AuditLogService (use case)
        |
Repository (lock + append)
        |
AuditLog table (hash chain)
```

---

# Audit Log - Capas (Clean Architecture)

Domain:

- `audit-log-entry.entity.ts`
- `audit-log.repository.ts` (puerto)
- `audit-log.factory.ts`

Application:

- `audit-log.service.ts` (caso de uso)

Infrastructure:

- `prisma-audit-log.repository.ts`
- `audit-event.consumer.ts`
- `audit-log.controller.ts`

---

# Audit Log - Inmutabilidad de Cadena

Cada registro incluye:

- `previousHash`: hash del registro anterior.
- `hash`: SHA-256 del contenido actual + `previousHash`.

Contenido hasheado:

- id, action, entityType, entityId
- actorId, actorRole, ipAddress
- payload, result, details, timestamp, previousHash

Si un dato cambia en BD, la verificacion detecta ruptura.

---

# Audit Log - Integridad Verificable

Endpoint:

- `GET /audit-log/verify-integrity`

Respuesta esperada:

```json
{ "isValid": true, "brokenAt": null }
```

Validacion:

- Recalculo del hash de cada entrada.
- Verificacion de enlace con hash previo.
- Deteccion de primer bloque inconsistente.

---

# Audit Log - Decisiones Tecnicas Relevantes

- Procesamiento asincrono por broker para no bloquear negocio.
- Lock transaccional en append para evitar colisiones de `previousHash`.
- Migraciones versionadas en `audit-service`.
- Separacion de base de datos para dominio de auditoria.

Resultado:

- Trazabilidad robusta.
- Mejor aislamiento arquitectonico.

---

<!-- _backgroundColor: #117a65 -->
<!-- _color: white -->
<!-- _class: lead -->

# Patron Implementado

## Service Discovery
### Registro y descubrimiento dinamico

**Integrante: Ayen Henriquez**

---

# Service Discovery - Problema Especifico

Necesidad:

- Evitar URLs hardcodeadas entre servicios.
- Poder escalar instancias y seguir resolviendo por nombre logico.
- Detectar instancias caidas con health checks.

Riesgos sin este patron:

- Configuraciones rigidas por entorno.
- Rotura al escalar/redistribuir contenedores.
- Mayor tiempo de recuperacion ante fallos parciales.

---

<!-- _class: compact -->

# Service Discovery - Implementacion (Consul)

Ubicacion en codigo:

- `services/claims-service/src/infrastructure/service-discovery/service-discovery.module.ts`
- `services/claims-service/src/infrastructure/service-discovery/service-discovery.service.ts`
- `services/claims-service/src/infrastructure/app.controller.ts`
- `services/claims-service/src/infrastructure/app.module.ts`

Piezas:

- Registro automatico al iniciar: `onModuleInit()` → `agent.service.register()`.
- Desregistro al apagar: `onModuleDestroy()` → `agent.service.deregister()`.
- Discovery: `discoverService(serviceName)` retorna una instancia saludable.
- Visualizacion: `getAllInstances(serviceName)` para la demo.

---

# Service Discovery - Endpoints de soporte

Health check (para Consul y liveness):

- `GET /health` → `{ status, service, version, uptime, timestamp }`

Demo de registry en tiempo real:

- `GET /registry/:serviceName`
- Ejemplo: `GET /registry/claims-service`
  - retorna `totalInstances` + IDs/address/port/tags

---

# Service Discovery - Demo sugerida

1. Verificar salud de la instancia:
        - `GET /health`
2. Ver instancias registradas:
        - `GET /registry/claims-service`
3. (Opcional) Escalar y repetir:
        - `docker compose scale claims-service=3`

Nota: requiere Consul disponible (en compose o externo).

---

<!-- _class: compact -->

# Service Discovery - Variables de Entorno

Con defaults para Docker:

- `CONSUL_HOST` (default: `consul`)
- `CONSUL_PORT` (default: `8500`)
- `SERVICE_HOST` (default: `claims-service`)
- `SERVICE_PORT` (default: `3000`)

Nota:

- Si Consul no esta disponible, el servicio NO se cae: solo registra error y continua el arranque.

---

# Patron - Saga (Placeholder)

Estado: En diseno

Completar en esta seccion:

- Problema distribuido a coordinar.
- Flujo de pasos y compensaciones.
- Componente donde vive.
- Evidencia tecnica (codigo/diagrama).

---

# Patron - Outbox Pattern (Placeholder)

Estado: En diseno

Completar en esta seccion:

 - Tabla outbox y esquema.
 - Publicador/reintentos/idempotencia.
 - Integracion con transaccion del dominio.
 - Garantias de entrega.

---

# Patron - Anti-Corruption Layer (Placeholder)

Estado: En diseno

Completar en esta seccion:

- Sistema externo objetivo.
- Traduccion de contratos.
- Mapeo DTO externo -> modelo de dominio.
- Politica de errores/versionado.

---

# Diagramas Obligatorios (Checklist)

- C4 Contexto: [pendiente]
- C4 Contenedores: [pendiente]
- C4 Componentes: [pendiente]
- Diagrama de BD: [pendiente]
- Prototipos Figma: [pendiente]

Regla:

- Ningun diagrama debe contradecir la implementacion.

---

# Mapa de Responsabilidades (Exposicion)

| Estudiante | Que explica | Evidencia que muestra |
| :--- | :--- | :--- |
| Andres Carrero | Saga | Diagrama de orquestacion + flujo |
| Sebastian Ibanez | Audit Log | Flujo eventos + hash chain + endpoint integridad |
| Ayen Henriquez | Service Discovery | `GET /health` + `GET /registry/:serviceName` + registro/desregistro en Consul |
| Luis Robles | Outbox | Flujo transaccion + publicacion garantizada |
| Andres Serrano | ACL | Adaptadores y traduccion de contratos |

---

# Cierre

Estado actual:

- Audit Log implementado y validado.
- Service Discovery implementado en `claims-service` (Consul + endpoints de demo).
- Demas patrones definidos a nivel de arquitectura objetivo.

Siguiente paso del equipo:

1. Completar evidencia tecnica de cada patron.
2. Hacer reproducible la demo de Service Discovery (Consul disponible en compose o guia de ejecucion).
3. Cerrar diagramas C4/BD/Figma.
4. Ensayar exposicion con preguntas por integrante.

---

# Preguntas?
