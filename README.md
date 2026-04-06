# Lost & Found Uninorte

[![NestJS](https://img.shields.io/badge/backend-NestJS-red.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/frontend-React-blue.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/orm-Prisma-darkblue.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/infra-Docker-blue.svg)](https://www.docker.com/)
[![RabbitMQ](https://img.shields.io/badge/messaging-RabbitMQ-orange.svg)](https://www.rabbitmq.com/)

Sistema integral para la gestion de objetos perdidos en la Universidad del Norte. Este proyecto utiliza una arquitectura de microservicios robusta y sigue los principios de Clean Architecture para garantizar escalabilidad y mantenibilidad.

---

## Inicio Rapido (Docker)

La forma recomendada de ejecutar el proyecto es utilizando Docker Compose, que orquestara la base de datos, el broker de mensajeria y los servicios.

```bash
# Levantar todos los servicios (con Hot Reload en servicios)
docker compose up --build -d
```

### Servicios y Paneles:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Claims Service (API):** [http://localhost:3000](http://localhost:3000)
- **Audit Service (API):** [http://localhost:3001](http://localhost:3001)
- **RabbitMQ Management:** [http://localhost:15672](http://localhost:15672) (user: `guest`, pass: `guest`)
- **Prisma Studio (Local):** `cd services/claims-service && npx prisma studio`

### Nota de Infraestructura
- `claims-service` aplica migraciones con `prisma migrate deploy`, ejecuta seed inicial y luego inicia la API.
- `audit-service` aplica migraciones versionadas (`services/audit-service/prisma/migrations`) y luego inicia la API.

---

## Arquitectura y Patrones

### Estilo Arquitectonico: Microservicios
El sistema esta disenado para ser distribuido, utilizando RabbitMQ como Message Broker para la comunicacion asincrona entre servicios.

### Diseno Interno: Clean Architecture
Cada servicio (ej: `claims-service`) se organiza en capas:
- **Domain:** Entidades y reglas de negocio puras.
- **Application:** Casos de uso y patrones de comportamiento (Saga, Factory, CoR, Visitor).
- **Infrastructure:** Controladores, Adaptadores (Prisma), Proxies y configuracion.

### Patrones Arquitectonicos Asignados:
- **Saga:** Flujo de reclamacion (Andres Carrero).
- **Audit Log:** Trazabilidad (Sebastian Ibanez).
- **Service Discovery:** Descubrimiento (Ayen Henriquez).
- **Outbox Pattern:** Consistencia de eventos (Luis Robles).
- **Anti-Corruption Layer:** Integracion externa (Andres Serrano).

### Audit Log Implementado
- Captura asincrona de eventos desde `claims-service` hacia `audit-service` usando RabbitMQ (`audit.event.created`).
- Cadena de integridad criptografica basada en `previousHash` + `hash` SHA-256 por registro.
- Verificacion de integridad expuesta en `GET /audit-log/verify-integrity`.
- Separacion por capas: el caso de uso de auditoria consume puertos de dominio y el lock transaccional vive en infraestructura.

---

## Estructura del Proyecto

```text
.
├── services/               # Microservicios del sistema
│   ├── claims-service/     # Servicio principal de reclamaciones
│   │   ├── src/
│   │   │   ├── domain/     # Capa de Dominio
│   │   │   ├── application/# Capa de Aplicacion
│   │   │   └── infrastructure/ # Capa de Infraestructura
│   │   └── prisma/         # Esquema de base de datos
│   └── shared/             # Codigo y tipos compartidos
├── frontend/               # Interfaz de usuario en React
├── docs/                   # Documentacion detallada y rubrica
└── docker-compose.yml      # Infraestructura optimizada
```

---

## Desarrollo y Convenciones

Para mantener la uniformidad, todos los colaboradores deben seguir las reglas definidas en:
- **[GEMINI.md](./GEMINI.md)**: Reglas de branching, commits y codificacion.
- **[AI_MAP.md](./docs/AI_MAP.md)**: Mapa de localizacion de patrones y logica.

---

## Pruebas y Validacion

```bash
# Pruebas e2e en el servicio de reclamaciones
cd services/claims-service
npm run test:e2e
```
