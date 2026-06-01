# Lost & Found Uninorte

Sistema de gestión de objetos perdidos en la Universidad del Norte.

## Levantar el proyecto

```bash
cp .env.example .env
docker compose up --build -d
```

### Accesos

| Servicio | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Claims API** | http://localhost:3000 |
| **Audit API** | http://localhost:3001 |
| **RabbitMQ** | http://localhost:15672 (guest/guest) |

## Tests

```bash
cd services/claims-service && npm run test:e2e
```
