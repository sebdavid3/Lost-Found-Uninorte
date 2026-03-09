# Lost & Found Uninorte

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
```

3. Construir/sincronizar los tipos de Prisma
```bash
npx prisma generate
```

4. Llenar la base de datos con informacion semilla (Users y Objects de prueba)
```bash
npx ts-node -r dotenv/config prisma/seed.ts
```

5. Levantar el entorno de desarrollo
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