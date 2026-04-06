# Lost & Found Uninorte

<<<<<<< HEAD
[![NestJS](https://img.shields.io/badge/backend-NestJS-red.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/frontend-React-blue.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/orm-Prisma-darkblue.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/infra-Docker-blue.svg)](https://www.docker.com/)
[![RabbitMQ](https://img.shields.io/badge/messaging-RabbitMQ-orange.svg)](https://www.rabbitmq.com/)

Sistema integral para la gestión de objetos perdidos en la Universidad del Norte. Este proyecto utiliza una arquitectura de microservicios robusta y sigue los principios de Clean Architecture para garantizar escalabilidad y mantenibilidad.

---

## Inicio Rápido (Docker)

La forma recomendada de ejecutar el proyecto es utilizando Docker Compose, que orquestará la base de datos, el broker de mensajería y los servicios.

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

### Estilo Arquitectónico: Microservicios
El sistema está diseñado para ser distribuido, utilizando RabbitMQ como Message Broker para la comunicación asíncrona entre servicios.

### Diseño Interno: Clean Architecture
Cada servicio (ej: `claims-service`) se organiza en capas:
- **Domain:** Entidades y reglas de negocio puras.
- **Application:** Casos de uso y patrones de comportamiento (Saga, Factory, CoR, Visitor).
- **Infrastructure:** Controladores, Adaptadores (Prisma), Proxies y configuración.

### Patrones Arquitectónicos Asignados:
- **Saga:** Flujo de reclamación (Andres Carrero).
- **Audit Log:** Trazabilidad (Sebastian Ibañez).
- **Service Discovery:** Descubrimiento (Ayen Henriquez).
- **Outbox Pattern:** Consistencia de eventos (Luis Robles).
- **Anti-Corruption Layer:** Integración externa (Andres Serrano).

### Audit Log Implementado
- Captura asíncrona de eventos desde `claims-service` hacia `audit-service` usando RabbitMQ (`audit.event.created`).
- Cadena de integridad criptográfica basada en `previousHash` + `hash` SHA-256 por registro.
- Verificación de integridad expuesta en `GET /audit-log/verify-integrity`.
- Separación por capas: el caso de uso de auditoría consume puertos de dominio y el lock transaccional vive en infraestructura.

---

## Estructura del Proyecto

```text
.
├── services/               # Microservicios del sistema
│   ├── claims-service/     # Servicio principal de reclamaciones
│   │   ├── src/
│   │   │   ├── domain/     # Capa de Dominio
│   │   │   ├── application/# Capa de Aplicación
│   │   │   └── infrastructure/ # Capa de Infraestructura
│   │   └── prisma/         # Esquema de base de datos
│   └── shared/             # Código y tipos compartidos
├── frontend/               # Interfaz de usuario en React
├── docs/                   # Documentación detallada y rúbrica
└── docker-compose.yml      # Infraestructura optimizada
```

---

## Desarrollo y Convenciones

Para mantener la uniformidad, todos los colaboradores deben seguir las reglas definidas en:
- **[GEMINI.md](./GEMINI.md)**: Reglas de branching, commits y codificación.
- **[AI_MAP.md](./docs/AI_MAP.md)**: Mapa de localización de patrones y lógica.

---

## Pruebas y Validación

```bash
# Pruebas e2e en el servicio de reclamaciones
cd services/claims-service
npm run test:e2e
```
=======
Bienvenido al repositorio Backend del sistema digital Lost & Found Uninorte. Este proyecto forma parte del Taller de Diseño de Software para modernizar y digitalizar la gestión de objetos perdidos de Bienestar Universitario.

## Descripcion del Proyecto
El sistema actual de la universidad carece de trazabilidad eficiente. El flujo principal que este proyecto resuelve es:
`Recepcion -> Almacenamiento -> Registro/Seguimiento -> Verificacion de Propiedad -> Entrega`

Esta API REST provee toda la logica conversacional, persistencia y seguridad subyacentes construidos sobre infraestructura moderna y aplicando multiples Patrones de Diseno Arquitectonico y de Comportamiento.

## Stack Tecnologico
- **Framework Backend:** NestJS (v11)
- **Lenguaje:** TypeScript
- **ORM:** Prisma (v7) con Driver Adapter
- **Base de Datos:** PostgreSQL
- **Infraestructura:** Docker & Docker Compose

## Arquitectura y Patrones de Diseno Implementados

Este repositorio esta dividido en modulos estrategicos, donde se implementan los siguientes patrones clave:

### 1. Persistencia y Creacion (Abstract Factory)
El nucleo de la base de datos (Entidades: User, Object, Claim, Evidence). 
Implementa el patron **Abstract Factory** al registrar reclamaciones, decidiendo en tiempo real que tipo de evidencias exigir segun la naturaleza del objeto:
- **ElectronicClaimFactory:** Filtro rigido (Numeros de serie o facturas adjuntas).
- **CommonClaimFactory:** Filtro liviano (Descripciones y fotografias referenciales).

*Nota: Es imposible crear solicitudes de reclamacion sobre objetos que previamente no tengan una foto registrada (Norma Critica Institucional).*

### 2. Seguridad Estructural y Consultas (Proxy)
Capa defensora que intercepta las peticiones de evidencias y reclamaciones. Aplica un Patron **Proxy** de seguridad y centraliza los Endpoints Especiales de Auditoria (Filtros por Estado o Fechas).

### 3. Logica de Flujo de Aprobacion (Chain of Responsibility)
Orquesta el paso de una reclamacion de estado PENDING a APPROVED. Aplica el Patron **Chain of Responsibility** iterando sobre:
1. Verificacion de Identidad (IdentityHandler).
2. Disponibilidad del Objeto (AvailabilityHandler).
3. Coincidencias de Evidencias (EvidenceMatchHandler).

### 4. Interfaz y Operaciones Desacopladas (Visitor)
Implementa el Patron **Visitor** sobre la base abstracta de Datos y Evidencias para correr rutinas de auditoria y algoritmos de similitud textual.

---

## Guia Rapida de Inicializacion (Local)

### Requisitos Previos
1. Node.js instalado.
2. Docker Desktop en ejecucion.

### Pasos de Instalacion

1. Levantar la base de datos PostgreSQL en background
```bash
docker-compose up -d db
```

2. Navegar a la carpeta backend e instalar dependencias
```bash
cd backend
npm install --legacy-peer-deps
cp .env.example .env
```

3. Construir/sincronizar los tipos de Prisma
```bash
npx prisma generate
```

4. Aplicar las migraciones sobre PostgreSQL
```bash
npx prisma migrate deploy
```

5. Llenar la base de datos con informacion semilla (Users y Objects de prueba)
```bash
npx ts-node prisma/seed.ts
```

6. Levantar el entorno de desarrollo
```bash
npm run start:dev
```
La API estara disponible en: `http://localhost:3000`

### Visualizar Base de Datos (Prisma Studio)
Si necesitas manipular directamente los datos o buscar IDs, Prisma expone una UI amigable:
```bash
cd backend
npx prisma studio
```
El panel estara disponible en: `http://localhost:5555`
>>>>>>> af53bcc1a27495652525bc77a91a9a38d6bbafe8
