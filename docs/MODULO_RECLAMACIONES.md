# Documentación: Módulo de Reclamaciones (Claims)

## 📌 Descripción General
Este módulo gestiona la creación, verificación y ciclo de vida de las solicitudes (Reclamaciones) por objetos perdidos en el sistema Lost & Found Uninorte. Se implementó utilizando **NestJS**, tipado estricto con **TypeScript** y gestión de bases de datos mediante **Prisma ORM** (conectado a un PostgreSQL en Docker).

## ✨ Funcionalidades Principales

1. **CRUD Completo de Reclamaciones**: Endpoints para `POST`, `GET`, `PATCH` y `DELETE` ubicados en el controlador `/claims`.
2. **Validación de Ciclo de Vida**: Las reclamaciones solo pueden editarse o cancelarse si su estado se encuentra en `PENDING`. Reclamaciones aprobadas o rechazadas son inmutables.
3. **Regla de Negocio "Foto Obligatoria"**: Por política institucional, es imposible abrir una reclamación sobre un objeto si este no tiene una fotografía de referencia ya cargada en la base de datos de objetos.
4. **Patrón Abstract Factory para Evidencias**: Las evidencias obligatorias varían según la categoría del objeto.
   - **Objetos Electrónicos/Accesorios**: Exigen al menos un "Número de Serie" o "Factura Digital".
   - **Objetos Comunes**: Exigen al menos una "Descripción Detallada" y "Foto de Referencia".

## 🚀 Guía de Pruebas Locales

Para probar este módulo, debes utilizar el script de seeding proveído y herramientas como **Postman**, **Insomnia** o realizar peticiones `fetch`.

### 1. Preparación del Entorno Operativo
Evita problemas de base de datos levantando el stack Docker y poblando (seeding) localmente.

```bash
# Entrar a la app, levantar la db y el servidor
docker-compose up -d db
cd backend
npm install
npm run start:dev
```

En otra terminal, corre los datos de prueba (`User`, `Object(Common)` sin foto, `Object(Electronic)` con foto):

```bash
cd backend
npx ts-node -r dotenv/config prisma/seed.ts
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

### 3. Pruebas Automáticas End-to-End
Se dejó un script `test-endpoints.js` configurado que ejecuta precisamente estos tres flujos y además prueba que un claim `APPROVED` rechace actualizaciones en bloque.

Ejecútalo (con tu servidor Nest encendido) así:
```bash
node -r dotenv/config test-endpoints.js
```
