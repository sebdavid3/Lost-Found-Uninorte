# Lost & Found Uninorte - Backend

Este es el módulo de servidor del sistema Lost & Found Uninorte, desarrollado con NestJS.

## Tecnologías
- Framework: NestJS
- ORM: Prisma
- Base de Datos: PostgreSQL
- Validación: class-validator & class-transformer

## Patrones de Diseño Implementados
- Abstract Factory: Validación de evidencias por categoría de objeto.
- Chain of Responsibility: Proceso de verificación de reclamaciones.
- Proxy: Control de acceso y auditoría en ClaimsService.
- Visitor: Generación de reportes de auditoría y análisis de similitud.

## Ejecución
Para instrucciones detalladas de ejecución y configuración, por favor consulta el [README principal en la raíz del proyecto](../README.md).

## Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```
