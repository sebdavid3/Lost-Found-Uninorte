# 6.5 Patrones de arquitectura

Estado: EN PROGRESO
Responsable: TBD
Fecha de actualizacion: 2026-04-05

## Tabla obligatoria

| Estudiante | Patron | Componente donde se aplica | Problema que resuelve |
| :--- | :--- | :--- | :--- |
| Andres Carrero | Saga | Orquestador de flujo de reclamacion (componente de aplicacion/microservicio de coordinacion) | Coordinar pasos distribuidos, definir compensaciones y evitar estados inconsistentes en procesos multi-paso |
| Sebastian Ibanez | Audit Log | `services/audit-service/` y `services/claims-service/src/application/interceptors/audit-log.interceptor.ts` | Trazabilidad inmutable de acciones, no repudio y verificacion de integridad por hash chain |
| Ayen Henriquez | Service Discovery | Componente de registro y descubrimiento de servicios (objetivo de arquitectura) | Resolver endpoints dinamicamente y reducir acoplamiento por configuraciones estaticas |
| Luis Robles | Outbox Pattern | Componente Outbox vinculado al dominio transaccional de reclamaciones (objetivo de arquitectura) | Garantizar consistencia entre commit de base de datos y publicacion de eventos |
| Andres Serrano | Anti-Corruption Layer | Capa ACL en integraciones externas (adaptadores/anti-corruption en borde de infraestructura) | Traducir contratos externos al lenguaje del dominio interno y aislar cambios de terceros |

## Evidencia minima por patron

- Ubicacion exacta en codigo.
- Flujo que atraviesa el sistema.
- Beneficio tecnico y limitaciones.
- Caso concreto donde evita un problema real.

## Nota de avance

En este corte, Audit Log cuenta con evidencia tecnica implementada y desplegada. Los demas patrones aparecen definidos a nivel de arquitectura objetivo y deben completarse con evidencia de implementacion en sus respectivas secciones tecnicas.

## Checklist de cierre
- [ ] Todos los patrones con componente concreto (sin TBD).
- [ ] Todos los patrones con problema resuelto claramente formulado.
- [ ] Evidencia tecnica verificable por patron.
