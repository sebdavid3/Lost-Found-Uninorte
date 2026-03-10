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

## Estado Actual de Implementacion (Marzo 2026)

### Modulo Claims completado
- CRUD base de reclamaciones en `/claims`.
- Patron **Abstract Factory** para validacion de evidencias por categoria de objeto.
- Patron **Proxy** para control de acceso de lectura por rol (`ADMIN`/`STUDENT`).
- Endpoints administrativos de filtro:
	- `GET /claims/filter/status?status=PENDING`
	- `GET /claims/filter/date-range?start=...&end=...`
- Patron **Chain of Responsibility** para verificacion administrativa:
	- `POST /claims/:id/verify`
	- Cadena: `IdentityHandler -> AvailabilityHandler -> EvidenceMatchHandler`.
- Manejo global de `ForbiddenException` con payload amigable de seguridad.

### Regla adicional persistida
El modelo `Claim` ahora incluye `rejectionReason` para almacenar el motivo exacto de rechazo cuando falla la verificacion administrativa.

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

Comportamiento implementado:
- `ADMIN`: acceso a todas las reclamaciones y evidencias.
- `STUDENT`: acceso solamente a reclamaciones donde `claim.userId === x-user-id`.
- Trazabilidad en logs: `ACCESO A DATOS ACCESIBLES DE CLAIM: {id}`.
- Si no tiene permiso: respuesta `403` desde filtro global.

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
1. [Node.js](https://nodejs.org/es/download/) instalado (recomendado `>= 20.19`).
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) en ejecucion.

**Instalacion alternativa via terminal (Windows con `winget`):**
```bash
# Instalar Node.js (LTS)
winget install OpenJS.NodeJS.LTS

# Instalar Docker Desktop
winget install Docker.DockerDesktop
```

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

### Pruebas rapidas del backend

Ejecutar pruebas puntuales del modulo claims:
```bash
cd backend
npm test -- claims.service.spec.ts claims.controller.spec.ts
```

Compilar backend:
```bash
cd backend
npm run build
```

### Visualizar Base de Datos (Prisma Studio)
Si necesitas manipular directamente los datos o buscar IDs, Prisma expone una UI amigable:
```bash
cd backend
npx prisma studio
```
El panel estara disponible en: `http://localhost:5555`

---

## Headers requeridos para endpoints de lectura/administracion

Para consultas con proxy y endpoints administrativos debes enviar:
- `x-user-role`: `ADMIN` o `STUDENT`
- `x-user-id`: UUID del usuario autenticado/simulado

Ejemplo (rol admin):
```bash
curl -X GET "http://localhost:3000/claims/filter/status?status=PENDING" \
	-H "x-user-role: ADMIN" \
	-H "x-user-id: REEMPLAZAR_UUID_ADMIN"
```

## Flujo administrativo de verificacion (`/claims/:id/verify`)

1. Solo `ADMIN` puede verificar.
2. Se carga el claim completo (`user`, `object`, `evidences`).
3. Se ejecuta la cadena de handlers.
4. Si pasa: claim se actualiza a `APPROVED`.
5. Si falla: claim se actualiza a `REJECTED` y se persiste `rejectionReason`.

Respuesta de rechazo esperada:
```json
{
	"message": "Reclamación rechazada durante verificación administrativa.",
	"eslabonFallido": "EvidenceMatchHandler",
	"motivo": "La reclamación no contiene evidencia de tipo 'SERIAL_NUMBER'.",
	"claimId": "...",
	"status": "REJECTED"
}
```

---

## Frontend (React UI)

El repositorio incluye ahora un proyecto React (Vite) listo para ser desplegado en Vercel, proporcionando la interfaz gráfica de usuario para el sistema "Lost & Found Uninorte".

### Inicialización Local del Frontend

1. Dirígete a la carpeta `frontend`:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

### Despliegue en Vercel

El proyecto está configurado y optimizado para ser desplegado en Vercel de manera directa. 

1. Ve a [vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Autoriza y selecciona tu repositorio `Lost-Found-Uninorte`.
3. En la configuración del Framework Preset, Vercel detectará **Vite** automáticamente.
4. **Root Directory:** Asegúrate de configurar el "Root Directory" seleccionando la subcarpeta `frontend`.
5. Haz clic en **Deploy**. 

*Nota: Se ha incluido el archivo `vercel.json` dentro de `frontend` para manejar correctamente las rutas si decides expandir la aplicación a una Single Page Application (SPA).*