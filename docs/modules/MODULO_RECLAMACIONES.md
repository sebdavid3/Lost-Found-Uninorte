# Documentación: Módulo de Reclamaciones (Claims)

## Descripción General
Este módulo gestiona la creación, verificación y ciclo de vida de las solicitudes (Reclamaciones) por objetos perdidos en el sistema Lost & Found Uninorte. Se implementó utilizando **NestJS**, tipado estricto con **TypeScript** y gestión de bases de datos mediante **Prisma ORM** (conectado a un PostgreSQL en Docker).

## Funcionalidades Principales

1. **CRUD Completo de Reclamaciones**: Endpoints para `POST`, `GET`, `PATCH` y `DELETE` ubicados en el controlador `/claims`.
2. **Validación de Ciclo de Vida**: Las reclamaciones solo pueden editarse o cancelarse si su estado se encuentra en `PENDING`. Reclamaciones aprobadas o rechazadas son inmutables.
3. **Regla de Negocio "Foto Obligatoria"**: Por política institucional, es imposible abrir una reclamación sobre un objeto si este no tiene una fotografía de referencia ya cargada en la base de datos de objetos.
4. **Patrón Abstract Factory para Evidencias**: Las evidencias obligatorias varían según la categoría del objeto.
   - **Objetos Electrónicos/Accesorios**: Exigen al menos un "Número de Serie" o "Factura Digital".
   - **Objetos Comunes**: Exigen al menos una "Descripción Detallada" y "Foto de Referencia".
5. **Patrón Proxy de Seguridad para Lecturas**:
  - Los endpoints de lectura usan un proxy (`ClaimsServiceProxy`) que controla acceso por rol basado en headers.
  - `ADMIN`: puede consultar todas las reclamaciones y evidencias.
  - `STUDENT`: solo puede consultar reclamaciones donde `claim.userId` coincide con `x-user-id`.
  - Si intenta consultar un claim ajeno, se lanza `ForbiddenException`.
  - Cada acceso autorizado registra trazabilidad: `ACCESO A DATOS ACCESIBLES DE CLAIM: {id}`.
6. **Filtros Especializados de Administración**:
  - `GET /claims/filter/status?status=PENDING`
  - `GET /claims/filter/date-range?start=2026-03-01T00:00:00.000Z&end=2026-03-09T23:59:59.999Z`
7. **Manejo Global de Errores de Seguridad**:
  - Se registra un `ExceptionFilter` global para `ForbiddenException`.
  - Respuesta estándar:
    ```json
    {
     "seguridad": "Acceso denegado a la evidencia solicitada",
     "timestamp": "2026-03-09T00:00:00.000Z"
    }
    ```
8. **Chain of Responsibility para Verificación Administrativa**:
  - Endpoint: `POST /claims/:id/verify`.
  - Cadena de validación secuencial: `IdentityHandler -> AvailabilityHandler -> EvidenceMatchHandler`.
  - Si toda la cadena pasa, la reclamación se actualiza a `APPROVED`.
  - Si falla un eslabón, la reclamación se actualiza a `REJECTED` y se persiste `rejectionReason` en la tabla `Claim`.
  - La respuesta HTTP reporta el eslabón fallido (`eslabonFallido`) y el motivo exacto (`motivo`).

## Headers requeridos para lectura

Para `GET /claims`, `GET /claims/:id`, y endpoints de filtro:

- `x-user-role`: `ADMIN` o `STUDENT`
- `x-user-id`: UUID del usuario autenticado/simulado

> Nota: Si faltan o son inválidos, el controlador responde `400 Bad Request`.

## Guía de Pruebas Locales

Para probar este módulo, debes utilizar el script de seeding proveído y herramientas como **Postman**, **Insomnia** o realizar peticiones `fetch`.

### 1. Preparación del Entorno Operativo
Evita problemas de base de datos levantando el stack Docker y poblando (seeding) localmente.

```bash
# Entrar a la app, levantar la db y el servidor
docker compose up -d db
cd services/claims-service
npm install
npm run start:dev
```

En otra terminal, corre los datos de prueba (`User`, `Object(Common)` sin foto, `Object(Electronic)` con foto):

```bash
cd services/claims-service
npm run seed:objects
npx prisma studio
```

### 2. Probando la API con Postman

Extrae de Prisma Studio (`localhost:5555`) el ID del estudiante, el ID del objeto *Común* y el ID del objeto *Electrónico*.

#### Prueba A: Regla de la Foto (Debe arrojar ERROR 400)
Asegura que no se reciben reclamaciones para el "Objeto Común" ya que no tiene foto de referencia registrada.
*   **Método:** `POST` a `http://localhost:3000/claims`
*   **Body (JSON):**
    ```json
    {
      "userId": "[ID_ESTUDIANTE]",
      "objectId": "[ID_OBJETO_COMUN_SIN_FOTO]",
      "objectCategory": "COMMON",
      "evidences": [
        { "type": "REFERENCE_PHOTO", "url": "http://foto" },
        { "type": "DETAILED_DESCRIPTION", "description": "Azul" }
      ]
    }
    ```

#### Prueba B: Rechazo del Abstract Factory (Debe arrojar ERROR 400)
Intentar registrar reclamación de "Objeto Electrónico" saltándose la regla de la factura o número de serie.
*   **Método:** `POST` a `http://localhost:3000/claims`
*   **Body (JSON):**
    ```json
    {
      "userId": "[ID_ESTUDIANTE]",
      "objectId": "[ID_OBJETO_ELECTRONICO]",
      "objectCategory": "ELECTRONIC",
      "evidences": [
        { "type": "REFERENCE_PHOTO", "url": "http://foto" }
      ]
    }
    ```

#### Prueba C: Flujo Exitoso Factura o Serie (Debe arrojar HTTP 201)
Proveer un número de serie válido al Electrónico.
*   **Método:** `POST` a `http://localhost:3000/claims`
*   **Body (JSON):**
    ```json
    {
      "userId": "[ID_ESTUDIANTE]",
      "objectId": "[ID_OBJETO_ELECTRONICO]",
      "objectCategory": "ELECTRONIC",
      "evidences": [
        { "type": "SERIAL_NUMBER", "description": "1234ADX" }
      ]
    }
    ```

#### Prueba D: Proxy de Seguridad para Estudiante (solo sus claims)

- **Método:** `GET` a `http://localhost:3000/claims`
- **Headers:**
  - `x-user-role: STUDENT`
  - `x-user-id: [ID_ESTUDIANTE]`

Debe retornar únicamente reclamaciones de ese estudiante.

#### Prueba E: Acceso Denegado a Claim Ajeno (Debe arrojar HTTP 403)

- **Método:** `GET` a `http://localhost:3000/claims/[ID_CLAIM_AJENO]`
- **Headers:**
  - `x-user-role: STUDENT`
  - `x-user-id: [ID_ESTUDIANTE]`

Debe responder:
```json
{
  "seguridad": "Acceso denegado a la evidencia solicitada",
  "timestamp": "..."
}
```

#### Prueba F: Filtro por Estado (ADMIN)

- **Método:** `GET` a `http://localhost:3000/claims/filter/status?status=PENDING`
- **Headers:**
  - `x-user-role: ADMIN`
  - `x-user-id: [ID_ADMIN]`

#### Prueba G: Filtro por Rango de Fecha `foundAt` (ADMIN)

- **Método:** `GET` a `http://localhost:3000/claims/filter/date-range?start=2026-03-01T00:00:00.000Z&end=2026-03-09T23:59:59.999Z`
- **Headers:**
  - `x-user-role: ADMIN`
  - `x-user-id: [ID_ADMIN]`

#### Prueba H: Verificación Exitosa de Reclamación PENDING (ADMIN)

- **Método:** `POST` a `http://localhost:3000/claims/[ID_CLAIM_PENDING]/verify`
- **Headers:**
  - `x-user-role: ADMIN`
  - `x-user-id: [ID_ADMIN]`

Respuesta esperada: claim en `APPROVED`.

#### Prueba I: Verificación Rechazada por Eslabón de Cadena

- **Método:** `POST` a `http://localhost:3000/claims/[ID_CLAIM_PENDING]/verify`
- **Headers:**
  - `x-user-role: ADMIN`
  - `x-user-id: [ID_ADMIN]`
- **Condición de prueba:** que el claim no tenga evidencia tipo `SERIAL_NUMBER`.

Respuesta esperada: HTTP `409` con payload similar a:
```json
{
  "message": "Reclamación rechazada durante verificación administrativa.",
  "eslabonFallido": "EvidenceMatchHandler",
  "motivo": "La reclamación no contiene evidencia de tipo 'SERIAL_NUMBER'.",
  "claimId": "...",
  "status": "REJECTED"
}
```

### 3. Pruebas Automáticas End-to-End
Se dejó un script `test-endpoints.js` configurado que ejecuta precisamente estos tres flujos y además prueba que un claim `APPROVED` rechace actualizaciones en bloque.

Ejecútalo (con tu servidor Nest encendido) así:
```bash
node -r dotenv/config test-endpoints.js
```
