# Rúbrica del Proyecto Final: Diseño de Software 2

## 1. Propósito del Proyecto

El proyecto final del curso tiene como propósito que cada grupo diseñe, construya y defienda una solución de software a partir de un problema seleccionado, aplicando de manera coherente:
- Un estilo arquitectónico principal para la organización global del sistema.
- Un conjunto de patrones de arquitectura alineados con el problema.
- Una implementación interna basada obligatoriamente en Clean Architecture.

El proyecto no busca únicamente que el sistema funcione, sino que evidencie decisiones de arquitectura justificadas, separación de responsabilidades, mantenibilidad, escalabilidad y claridad estructural.

## 2. Regla General Obligatoria

Todos los grupos deberán implementar su proyecto usando Clean Architecture dentro de cada microservicio.

Esto significa que, independientemente del estilo arquitectónico principal asignado al grupo, la solución debe organizarse internamente con separación clara entre capas, dependencias orientadas hacia el dominio y aislamiento de detalles de infraestructura.

- **Estilo arquitectónico principal:** Define la organización global del sistema.
- **Patrones de arquitectura:** Resuelven problemas arquitectónicos concretos.
- **Clean Architecture:** Define cómo se estructura internamente el código de la solución o de cada servicio/módulo.

## 3. Aclaración Importante: Qué sí se evalúa

Este proyecto evalúa principalmente:
- Estilos arquitectónicos.
- Patrones de arquitectura.
- Implementación disciplinada con Clean Architecture.

Se deben mantener los patrones de diseño clásicos ya implementados, por ejemplo:
- Singleton
- Factory
- Strategy
- Observer

## 4. Proyecto y Estilo Arquitectónico Principal

- **Proyecto:** Reclamación de objetos perdidos.
- **Estilo:** Microservicios.

## 5. Patrones Arquitectónicos Asignados por Estudiante

| Estudiante | Patrón | Enfoque |
| :--- | :--- | :--- |
| Andres Carrero | Saga | Flujo de reclamación |
| Sebastian Ibañez | Audit Log | Trazabilidad |
| Ayen Henriquez | Service Discovery | Descubrimiento de servicios |
| Luis Robles | Outbox Pattern | Consistencia entre base de datos y eventos |
| Andres Serrano | Anti-Corruption Layer | Integración segura con sistemas externos o heredados |

## 6. Requerimientos de la Entrega 1

### 6.1. Contexto del problema
- Descripción clara del problema.
- Alcance de la solución.
- Supuestos y restricciones.
- Justificación de la propuesta.

### 6.2. Actores del sistema
- Identificación de actores.
- Responsabilidades.
- Interacción con el sistema.

### 6.3. Requerimientos (Pendientes por definir)
- Mínimo 10 requerimientos funcionales.
- Mínimo 5 requerimientos no funcionales medibles.

### 6.4. Estilo arquitectónico principal
- Justificación del estilo y adecuación al problema.
- Ventajas y trade-offs introducidos.

### 6.5. Patrones de arquitectura (Tabla obligatoria)

| Estudiante | Patrón | Componente donde se aplica | Problema que resuelve |
| :--- | :--- | :--- | :--- |
| Andres Carrero | Saga | TBD | TBD |
| Sebastian Ibañez | Audit Log | TBD | TBD |
| Ayen Henriquez | Service Discovery | TBD | TBD |
| Luis Robles | Outbox Pattern | TBD | TBD |
| Andres Serrano | Anti-Corruption Layer | TBD | TBD |

### 6.6. Diagramas obligatorios
- Modelo C4: (Contexto, Contenedores, Componentes).
- Diagrama de base de datos.
- Prototipos: Creados en Figma.

## 7. Criterios de Evaluación Grupal

| Criterio | Peso |
| :--- | :--- |
| Análisis y diseño arquitectónico | 40% |
| Uso y justificación de patrones de arquitectura | 30% |
| Diagramas | 20% |
| Uso adecuado de diapositivas | 10% |

## 8. Penalizaciones
- Diagramas inconsistentes con la implementación.
- Exposición débil o sin dominio técnico del patrón asignado.
- Inasistencia al día de la exposición sin justa causa.
