# 6.4 Estilo arquitectonico principal

Estado: LISTO PARA REVISION
Responsable: TBD
Fecha de actualizacion: 2026-04-05

## Estilo seleccionado

Microservicios.

## Justificacion del estilo

Se adopta arquitectura de microservicios para separar dominios con responsabilidades distintas y ritmos de evolucion diferentes.

En el problema de objetos perdidos, el flujo de negocio principal (registro, reclamacion y verificacion) requiere respuestas rapidas y operacion transaccional sobre inventario y estado de reclamaciones. En paralelo, los patrones asignados al equipo (Saga, Audit Log, Service Discovery, Outbox y Anti-Corruption Layer) requieren componentes especializados con responsabilidades tecnicas diferentes.

Microservicios permite desacoplar ambos contextos para que:

- el dominio de reclamaciones evolucione sin romper trazabilidad,
- la auditoria escale y se endurezca de forma independiente,
- la publicacion de eventos criticos tenga consistencia transaccional (Outbox),
- la resolucion de endpoints entre servicios sea desacoplada (Service Discovery),
- las integraciones externas no contaminen el dominio (ACL),
- los fallos de un contexto no derriben toda la plataforma.

### Preguntas guia
- Que necesidad del problema justifica microservicios?
- Que limitaciones del enfoque monolitico se evitan?
- Que modulos requieren independencia de despliegue?

## Por que es adecuado para el problema

Es adecuado porque el proceso tiene actores, reglas y criticidad distintas por modulo:

- `claims-service`: logica transaccional de negocio, validaciones, autorizacion por rol y ciclo de vida de la reclamacion.
- `audit-service`: consumo asincrono de eventos, cadena hash de integridad y consultas historicas.

Y porque el roadmap de arquitectura asignada exige separar capacidades adicionales en componentes de servicio:

- Servicio/componente de orquestacion de Saga para coordinar pasos de negocio distribuidos.
- Servicio/componente de Service Discovery para registrar y resolver servicios dinamicamente.
- Servicio/componente Outbox para sincronizar cambios de BD con emision de eventos sin perdida.
- Capa/servicio de Anti-Corruption Layer para adaptar contratos externos al modelo de dominio interno.

Un enfoque monolitico concentraria ambas preocupaciones y aumentaria el acoplamiento entre reglas de negocio y trazabilidad. Al separar servicios, el sistema puede priorizar disponibilidad operacional del modulo de reclamaciones mientras mantiene evidencia de auditoria con procesamiento desacoplado por broker.

## Ventajas que aporta

- Separacion de responsabilidades por contexto de negocio.
- Escalabilidad selectiva: se puede escalar cada servicio segun su carga real.
- Menor impacto de cambios: la evolucion de un patron/servicio no obliga a redesplegar todo el backend.
- Resiliencia funcional: la captura de eventos por mensajeria desacopla componentes y reduce bloqueo en operaciones de usuario.
- Mejor alineacion con Clean Architecture al interior de cada servicio.
- Facilita ownership por integrante segun patron asignado y acelera trabajo en paralelo.

## Trade-offs que introduce

- Mayor complejidad operativa (orquestacion, redes, healthchecks, observabilidad).
- Coste adicional en consistencia y depuracion por comunicacion distribuida.
- Necesidad de manejar fallos parciales y reprocesos en integraciones asincronas.
- Mayor esfuerzo documental para mantener coherencia entre codigo, diagramas y despliegue.

## Decisiones tecnicas asociadas

- Comunicacion asincrona con RabbitMQ.
- Persistencia separada por contexto y por responsabilidades de auditoria/negocio.
- Clean Architecture interna por servicio.
- Contenedorizacion y orquestacion local con Docker Compose.
- Migraciones versionadas para trazabilidad estructural en `audit-service`.
- Service Discovery implementado con Consul como registro de servicios (registro/desregistro automatico en ciclo de vida de NestJS).

## Vista general de microservicios (actual y objetivo)

Actuales:

- `claims-service`: operaciones del dominio de reclamaciones y objetos.
- `audit-service`: trazabilidad inmutable y verificacion de integridad.

Servicios de soporte ya implementados / en integracion:

- `consul` (registry): registro y consulta de instancias para Service Discovery.

Objetivo de arquitectura segun patrones asignados:

- Componente de Saga para coordinar el flujo distribuido de reclamaciones.
- Componente de Service Discovery para registro/descubrimiento dinamico.
- Componente Outbox para entrega confiable de eventos de dominio.
- Componente ACL para integraciones externas sin acoplar el dominio.

## Checklist de cierre
- [x] Justificacion clara y contextualizada.
- [x] Ventajas y trade-offs balanceados.
- [x] Coherencia con implementacion real en codigo y compose.
