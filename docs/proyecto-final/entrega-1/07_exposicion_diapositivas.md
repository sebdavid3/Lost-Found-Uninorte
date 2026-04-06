# Exposicion obligatoria - Entrega 1

Estado: EN PROGRESO
Responsable: TBD
Fecha de actualizacion: 2026-04-05

## Contenido minimo de diapositivas

- Problema
- Solucion propuesta
- Estilo arquitectonico
- Patrones arquitectonicos
- Diagramas
- Mapa de responsabilidades por estudiante

## Guion sugerido por seccion

1. Problema y contexto (2-3 diapositivas)
2. Solucion y alcance (2 diapositivas)
3. Estilo arquitectonico y trade-offs (2 diapositivas)
4. Patrones por estudiante (5 diapositivas, una por patron)
5. Diagramas C4 + BD + Figma (3-4 diapositivas)
6. Cierre, riesgos y preguntas (1-2 diapositivas)

## Mapa de responsabilidades por estudiante

| Estudiante | Patron | Que explica en exposicion | Estado de preparacion |
| :--- | :--- | :--- | :--- |
| Andres Carrero | Saga | Donde vive, flujo, problema que resuelve | NO INICIADO |
| Sebastian Ibanez | Audit Log | Donde vive, flujo, integridad hash-chain | EN PROGRESO |
| Ayen Henriquez | Service Discovery | Consul como registry, registro/desregistro automatico, health checks y demo `/registry` | EN PROGRESO |
| Luis Robles | Outbox Pattern | Donde vive, consistencia transaccional | NO INICIADO |
| Andres Serrano | Anti-Corruption Layer | Donde vive, adaptacion de contratos externos | NO INICIADO |

## Demo sugerida - Service Discovery (2-3 minutos)

Objetivo: evidenciar que el servicio se registra en un registry y que se pueden consultar instancias saludables sin hardcodear direcciones.

1. Mostrar endpoint de salud:
	- `GET /health` en `claims-service` retorna estado + uptime.
2. Mostrar registro de instancias:
	- `GET /registry/claims-service` retorna `totalInstances` e IDs de instancia.
3. (Opcional si se escala) Escalar instancias y repetir consulta:
	- `docker compose scale claims-service=3`
	- repetir `GET /registry/claims-service` para ver varias instancias.

Nota: para que la demo funcione localmente, Consul debe estar disponible (contenedor en compose o servicio externo) porque el registro se hace contra el host `CONSUL_HOST`.

## Evaluacion individual (preparacion)

Cada integrante debe preparar:
- dominio del patron asignado,
- explicacion clara,
- respuestas a preguntas tecnicas.

## Checklist de cierre
- [ ] Deck completo con secciones minimas.
- [ ] Participacion de todos definida y ensayada.
- [ ] Script de preguntas frecuentes por patron.
