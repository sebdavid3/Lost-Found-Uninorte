# Mapa de Contexto para IA

Este documento ayuda a la IA a localizar rápidamente los eslabones de la arquitectura en la estructura de microservicios y Clean Architecture.

## Localización de Patrones (Backend: claims-service)

### Capa de Aplicación (Application Layer)
- **Chain of Responsibility (Handlers):** `services/claims-service/src/application/handlers/`
- **Abstract Factory (Factories):** `services/claims-service/src/application/factories/`
- **Visitor (Visitors):** `services/claims-service/src/application/visitors/`
- **Casos de Uso (Services):** `services/claims-service/src/application/services/claims.service.ts`

### Capa de Infraestructura (Infrastructure Layer)
- **Proxy de Seguridad:** `services/claims-service/src/infrastructure/controllers/claims.service.proxy.ts`
- **Controladores REST:** `services/claims-service/src/infrastructure/controllers/`
- **Adaptadores de Persistencia:** `services/claims-service/src/infrastructure/prisma.service.ts`
- **DTOs de Entrada:** `services/claims-service/src/application/dto/`

### Capa de Dominio (Domain Layer)
- **Interfaces Críticas:** `services/claims-service/src/application/factories/claim.factory.ts` 
- **Modelos de Negocio:** `services/claims-service/src/application/handlers/claim-verification.types.ts`

## Localización de Patrones (Frontend)
- **Proxy de Datos:** `frontend/src/patterns/DataProtectionProxy.tsx`
- **Form Factory:** `frontend/src/patterns/ClaimFormFactory.tsx`
- **Processing Stepper:** `frontend/src/patterns/ProcessingStepper.tsx`

## Entidades de Base de Datos
- **Esquema Prisma:** `services/claims-service/prisma/schema.prisma`
- **Seeder de Datos:** `services/claims-service/prisma/seed.cjs`

## Patrones Arquitectónicos
- **Audit Log Pattern (Microservicio Dedicado):** `services/audit-service/`
  - *Domain Factory:* `src/domain/factories/audit-log.factory.ts`
  - *Hash Chain Service:* `src/application/services/audit-log.service.ts`
  - *Integrity Query:* `src/infrastructure/controllers/audit-log.controller.ts` (`GET /audit-log/verify-integrity`)
  - *Transactional Hash Lock:* `src/infrastructure/persistence/prisma-audit-log.repository.ts`
  - *Versioned Migrations:* `prisma/migrations/`
  - *Data Capture (Interceptor):* `services/claims-service/src/application/interceptors/audit-log.interceptor.ts`
