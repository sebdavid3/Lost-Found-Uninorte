# Lost & Found Uninorte

Sistema para gestión de objetos perdidos en Universidad del Norte.

## Stack
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: React + Vite + Tailwind
- Infraestructura: Docker Compose

## Estructura
- `backend/`: API REST, Prisma, seed
- `frontend/`: interfaz web
- `docker-compose.yml`: orquestación completa

## Levantar todo con Docker (recomendado)

Desde la raíz del proyecto:

```bash
docker compose up --build -d
```

Esto levanta:
- `db` (PostgreSQL)
- `backend` (NestJS en `http://localhost:3000`)
- `frontend` (Nginx con build de Vite en `http://localhost:5173`)

### Qué hace backend al iniciar
En `docker-compose.yml`, backend ejecuta:
1. `npx prisma migrate deploy`
2. `npm run seed:objects`
3. `npm run start:prod`

Es decir: aplica migraciones, inserta datos semilla de objetos y luego inicia la API.

## Verificar estado

```bash
docker compose ps
docker compose logs -f backend
```

## Detener / limpiar

```bash
docker compose down
```

Borrar también volúmenes (incluye base de datos):

```bash
docker compose down -v
```

## Ejecución local (sin Docker)

### 1) Base de datos
Levanta PostgreSQL con Docker:

```bash
docker compose up -d db
```

### 2) Backend

```bash
cd backend
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy
npm run seed:objects
npm run start:dev
```

Backend local: `http://localhost:3000`

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local: `http://localhost:5173`

## Seed de objetos

Script disponible en backend:

```bash
npm run seed:objects
```

Archivo del seeder: `backend/prisma/seed.cjs`.

## Troubleshooting rápido

### Error de dependencias en build Docker backend (`ERESOLVE`)
Ya está resuelto en `backend/Dockerfile` usando:
- `npm ci --legacy-peer-deps`
- `npm prune --omit=dev --legacy-peer-deps`

### Error `Cannot find module 'dotenv'`
Ya está resuelto moviendo `dotenv` a `dependencies` de backend.

---
Si necesitas, puedo también actualizar `backend/README.md` y `frontend/README.md` para que queden alineados con esta guía principal.
