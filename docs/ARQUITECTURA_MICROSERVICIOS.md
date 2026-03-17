# Plan de Transición a Microservicios y Clean Architecture

## 1. Análisis del Estado Actual

El proyecto "Lost & Found Uninorte" actualmente opera bajo una arquitectura de monólito modular apoyada en NestJS para el backend, y React para el frontend.

### Componentes Actuales:
- **Backend (Monólito):**
  - Módulo de Objetos (`objects`)
  - Módulo de Reclamaciones (`claims`)
  - Persistencia con Prisma ORM acoplada a la capa de framework.
  - Implementación de patrones de diseño clásicos a nivel de controladores/servicios (Proxy para permisos, Abstract Factory para evidencias, Chain of Responsibility para validación).
- **Base de Datos:**
  - Una única base de datos relacional (PostgreSQL) para todos los módulos (`User`, `Object`, `Claim`, `Evidence`).

### Limitaciones Actuales para el Escalado:
- Fuerte acoplamiento entre la capa de dominio y la de infraestructura (Prisma ORM dictando los modelos).
- Un fallo o sobrecarga en el módulo de reclamaciones puede afectar el funcionamiento del módulo de objetos o usuarios.
- Dificultad para escalar independientemente las partes con mayor demanda (ej. visualización del catálogo de objetos frente a la gestión de reclamos).

---

## 2. Visión Objetivo: Microservicios + Clean Architecture

El cambio propuesto se basa en descomponer el monólito en servicios delimitados y organizar cada servicio internamente respetando los principios de Clean Architecture.

### 2.1 Descomposición en Microservicios

Aplicaremos el patrón *Database per Service* y separaremos el dominio por su *Bounded Context*:

1. **Servicio de Usuarios (Identity/Users Service):**
   - Gestión de estudiantes y administradores.
   - Autenticación y Autorización.
2. **Servicio de Catálogo/Objetos (Catalog Service):**
   - Responsable de registrar, consultar y gestionar el ciclo de vida inicial del objeto encontrado.
3. **Servicio de Reclamaciones (Claims Service):**
   - Responsable de recibir y procesar solicitudes de reclamo.
   - Depende de información del servicio de objetos (validación de existencia e imágenes) y usuarios.

### 2.2 Clean Architecture (Estructura Interna de cada Microservicio)

Cada microservicio debe estructurarse en capas para separar las reglas de negocio de los detalles técnicos:

- **Domain/Entities:** Lógica empresarial pura y objetos del negocio (ej. Reglas para considerar un reclamo como válido). No dependen de ninguna librería o framework.
- **Application/Use Cases:** Orquestación de casos de uso (ej. `CreateClaimUseCase`, `ApproveClaimUseCase`). Se comunican a través de interfaces (Puertos).
- **Interface Adapters:** Controladores (REST, gRPC, Eventos AMQP) y Presentadores. Adaptan los datos para la capa de aplicación o vistas externas.
- **Infrastructure:** Implementación de persistencia (Repositorios de Prisma), clientes HTTP, conectores de colas de mensajes (RabbitMQ/Kafka).

---

## 3. Plan de Migración e Implementación

### Fase 1: Desacoplamiento de la Base de Datos Histórica
- **Modelado:** Cada futuro microservicio debe tener su propio esquema o base de datos de PostgreSQL (o MongoDB si conviene).
- **Comunicación Inicial:** Comenzar comunicando el Módulo de Reclamos con el de Objetos mediante interfaces asíncronas o llamadas de red internas.

### Fase 2: Implementación de Comunicación entre Microservicios
- **Event-Driven Architecture (Recomendado):** Al crear un objeto en el `Catalog Service`, este emite un evento `ObjectCreatedEvent`.
- **API Gateway:** Implementar un Gateway (ej. Kong, o un BFF en NestJS) para centralizar la comunicación desde el frontend hacia los múltiples servicios.

### Fase 3: Refactorización a Clean Architecture en el Backend
Actualmente NestJS mezcla la inyección y lógica en los `Services`.
*Camino a seguir:*
1. Crear carpeta `domain/` (Entidades e Interfaces de Repositorios).
2. Crear carpeta `application/` (Capa de Casos de uso e interactores).
3. Mover la lógica de los controladores a adaptadores (Controllers / Event Listeners).
4. Implementar los Repositorios concretos en la carpeta `infrastructure/database/` usando Prisma.

---

## 4. Reevaluación de Patrones de Diseño Actuales

Los patrones implementados en la Etapa 1 seguirán siendo útiles, pero se moverán de capa:

- **Abstract Factory (Evidencias):** Encaja perfectamente en el **Dominio (Entities/Factories)**. Debe devolver entidades de negocio independientemente de si se persisten con Prisma o no.
- **Proxy (Seguridad):** El control de seguridad (headers `x-user-role`, `x-user-id`) debería manejarse a nivel del **API Gateway** o con Interceptores/Guardas en la capa de **Infrastructure/Adapters**. Idealmente, el servicio confiará en un token JWT inyectado.
- **Chain of Responsibility (Verificación Administrativa):** Pertenece a la capa de **Application (Casos de Uso)**. Permite que la lógica de validación se orqueste agnósticamente antes de actualizar la persistencia en Infraestructura.

## 5. Próximos Pasos Técnicos

1. Refactorizar el actual módulo `claims` separándolo del monólito, creando un nuevo proyecto NestJS para `claims-service`.
2. Integrar RabbitMQ o Kafka (en `docker-compose.yml`) para eventos de dominio.
3. Adaptar el Frontend (`Vite/React`) para consumir el nuevo API Gateway en lugar de hacerlo directamente a un único backend monolítico.
4. Implementar Autenticación real (JWT/OAuth) para remover headers mockeados y proxies de seguridad de prototipo.
