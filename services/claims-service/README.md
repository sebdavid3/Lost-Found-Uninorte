# Lost & Found Uninorte - Claims Service

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

Para ejecución local del servicio, copia primero variables de entorno:

```bash
cp .env.example .env
```

## Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Script de endpoints (requiere URL base de API)
CLAIMS_API_BASE_URL=http://<host>:<port> node test-endpoints.js
```
