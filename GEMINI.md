# Contexto de Desarrollo - Lost & Found Uninorte

Este archivo contiene las directrices críticas para el desarrollo asistido por IA y la colaboración entre humanos en este proyecto.

## 1. Reglas de Oro de Arquitectura
1. **Patrones GoF:** Este proyecto es estrictamente orientado a patrones. Antes de implementar cualquier lógica en `claims`, verifica si debe ir en un Handler (Chain of Responsibility), una Factory (Abstract Factory) o un Visitor.
2. **Clean Architecture (Obligatorio):** Cada microservicio debe estar organizado internamente por capas claras:
   - **Dominio:** Entidades y lógica de negocio pura.
   - **Aplicación:** Casos de uso y puertos.
   - **Infraestructura:** Adaptadores, Prisma, servicios externos.
3. **Tipado Estricto:** No se permite el uso de `any`. Todas las interfaces deben estar definidas y exportadas correctamente.
4. **Seguridad:** Todas las lecturas de reclamaciones deben pasar por el `ClaimsServiceProxy`.

## 2. Convenciones de Colaboración y Git

### Sistema de Branching (Estrategia: Integration Branch)
- **main:** Rama de producción/entrega. Solo recibe merges desde `test` tras validar una entrega completa.
- **test:** Rama de integración. **Todos los Pull Requests de funcionalidades deben apuntar aquí.** Es la rama donde se estabiliza el código antes de la entrega final.
- **feature/nombre-funcionalidad:** Rama para nuevas características (se crea desde `test`).
- **fix/nombre-error:** Rama para corrección de errores (se crea desde `test`).

**Flujo de Integración:** 
1. Crear `feature/xyz` desde `test`.
2. Realizar Pull Request de `feature/xyz` **hacia `test`**.
3. Revisión y mezcla en `test`.
4. Cuando el hito de la entrega esté listo y probado en `test`, se realiza un PR de **`test` hacia `main`**.

### Convenciones de Commits (Conventional Commits)
Los mensajes de commit deben seguir el formato: `tipo: descripción concisa en minúsculas`
- `feat`: Nueva funcionalidad (ej: `feat: implementar outbox pattern para eventos de claim`).
- `fix`: Corrección de un error (ej: `fix: corregir validación de mimetypes en evidencias`).
- `docs`: Solo cambios en documentación.
- `refactor`: Cambio de código que no añade funcionalidad ni corrige errores.
- `chore`: Tareas de mantenimiento (ej: `chore: actualizar dependencias de prisma`).
- `ci`: Cambios en configuración de Docker o despliegue.

### Variables y Nomenclatura
- **Variables/Funciones:** `camelCase` (ej: `isClaimApproved`).
- **Clases/Interfaces/Tipos:** `PascalCase` (ej: `ClaimVerificationContext`).
- **Constantes:** `UPPER_SNAKE_CASE` (ej: `MAX_EVIDENCE_SIZE`).
- **Archivos:** `kebab-case` (ej: `claim-factory.service.ts`).

## 3. Desarrollo Asistido por IA (Instrucciones para Agentes)
- **Mantener Uniformidad:** Antes de sugerir un cambio, lee `docs/AI_MAP.md` para entender dónde encaja el patrón.
- **No duplicar lógica:** Si una validación ya existe en un `Handler`, no la repitas en el `Controller`.
- **Explicación técnica:** Siempre justifica tus cambios basándote en la rúbrica del proyecto (Clean Architecture y Patrones Arquitectónicos).
- **Validación:** Al finalizar una tarea, verifica que no se hayan roto los principios de aislamiento de capas de Clean Architecture.

## 4. Mapa de Responsabilidades (Patrones Arquitectónicos)
| Estudiante | Patrón Asignado | Responsabilidad Técnica |
| :--- | :--- | :--- |
| Andres Carrero | Saga | Orquestación de flujos distribuidos. |
| Sebastian Ibañez | Audit Log | Trazabilidad inmutable de acciones. |
| Ayen Henriquez | Service Discovery | Localización dinámica de microservicios. |
| Luis Robles | Outbox Pattern | Consistencia transaccional de eventos. |
| Andres Serrano | Anti-Corruption Layer | Aislamiento de dependencias externas. |

---
*Este documento es dinámico y debe actualizarse si el equipo acuerda nuevas convenciones.*
