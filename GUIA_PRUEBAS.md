# Guía Paso a Paso para Pruebas del Sistema — Lost & Found Uninorte

Esta guía detalla de forma clara cómo validar el flujo completo de reclamaciones de objetos perdidos, desde el inicio de sesión del estudiante y el envío de evidencias válidas basadas en el DTO, hasta la aprobación por parte del Administrador y la visualización de la auditoría.

---

## 1. Acceso Inicial y Creación de Usuario Estudiante
El sistema no requiere contraseñas complejas. La autenticación se realiza mediante correo electrónico y auto-crea al usuario en la base de datos si no existe.

1. Abre tu navegador e ingresa a **[http://127.0.0.1:5173/login](http://127.0.0.1:5173/login)**.
2. Escribe un correo de estudiante, por ejemplo:
   * **`estudiante@uninorte.edu.co`**
3. Haz clic en **"Ingresar"**.
4. **¿Qué sucede internamente?** El `frontend` hace un request a `user-service`. Este servicio valida el correo y auto-crea el perfil asignándole el rol de `STUDENT` de forma instantánea.

---

## 2. Exploración del Catálogo de Objetos Perdidos
Una vez que hayas ingresado, serás redirigido al catálogo central de objetos perdidos:

1. Visualiza los objetos disponibles. Notarás que ahora cada objeto cuenta con una **imagen coherente de alta definición**:
   * El *MacBook Pro M1* muestra una laptop Apple.
   * La *Calculadora Científica Casio* muestra una calculadora real.
   * El *Termo Contigo Azul* muestra una botella metálica azul, etc.
2. Identifica un objeto que desees reclamar, por ejemplo, el **`MacBook Pro M1`** (Categoría: `ELECTRONIC`) o la **`Mochila Jansport Gris`** (Categoría: `COMMON`).
3. Haz clic en el botón **"Reclamar Objeto"** en la tarjeta de ese objeto para abrir el formulario de reclamación.

---

## 3. Envío de una Reclamación con Evidencias Válidas (DTO)
El servicio `claim-service` tiene validaciones estrictas y requiere que proveas evidencias convincentes según la categoría del objeto. Si envías el formulario vacío, el DTO bloqueará la petición.

### Inputs Correctos para Reclamar un Electrónico (ej. `MacBook Pro M1`):
1. **Lugar de Pérdida (`lostLocation`)**:
   * Dado que este campo en el formulario de la interfaz gráfica es un menú desplegable de selección estática, selecciona uno de los sitios de interés o bloques del campus disponibles, por ejemplo: **`Biblioteca`**, **`DuNord Plaza`** o **`Bloque B`**.
2. **Evidencias (Debes agregar al menos una)**:
   * Haz clic en **"Agregar Evidencia"**.
   * **Tipo**: Selecciona **`SERIAL_NUMBER`** (Número de Serie).
   * **Descripción**: Escribe el número de serie de tu equipo, por ejemplo: `C02FG821Q05D`.
   * *(Opcional)* Agrega una segunda evidencia:
     * **Tipo**: Selecciona **`DETAILED_DESCRIPTION`** (Descripción Detallada).
     * **Descripción**: Escribe: `Tiene un sticker de React pegado en la esquina superior izquierda de la tapa y una abolladura leve en la esquina inferior`.
3. Haz clic en **"Enviar Reclamación"**.
4. Recibirás un mensaje de confirmación flotante indicando que tu reclamo se ha enviado de forma exitosa en estado `PENDING`.

---

## 4. Gestión y Verificación Administrativa (Chain of Responsibility)
Para procesar, verificar y aprobar tu reclamación, debemos iniciar sesión como administrador:

1. Ve a **[http://127.0.0.1:5173/login](http://127.0.0.1:5173/login)** e inicia sesión con el correo administrador:
   * **`admin@uninorte.edu.co`**
2. Serás redirigido al **Dashboard de Administrador**.
3. En el menú lateral o superior, dirígete a **"Reclamaciones"** o **[http://127.0.0.1:5173/admin/claims](http://127.0.0.1:5173/admin/claims)**.
4. Ubica la reclamación del estudiante que acabas de enviar en el paso anterior.
5. Haz clic en **"Verificar"** para abrir el panel de control de decisión.
6. En este punto, puedes presionar **"Aprobar"** o **"Rechazar"**.
7. **¿Qué sucede al aprobar/rechazar?**
   * Se ejecuta la **Chain of Responsibility** (Cadena de Responsabilidad) en `claim-service`:
     1. `IdentityHandler`: Valida que el reclamante sea un usuario activo y no posea bloqueos.
     2. `AvailabilityHandler`: Confirma que el objeto siga disponible en bodega y no haya sido entregado.
     3. `EvidenceMatchHandler`: Analiza semánticamente las evidencias que ingresó el estudiante contra la descripción del objeto encontrado (usando algoritmo de similitud de texto).
   * Si pasa la cadena, el estado cambia a `APPROVED`.
   * Se emite un evento transaccional asíncrono (Outbox Pattern) a **RabbitMQ**.
   * **`audit-service`** consume el evento y registra la acción en su base de datos inmutable.

---

## 5. Auditoría Blockchain e Integridad de Logs
1. Desde la vista de administrador, dirígete a **"Logs de Auditoría"** o ingresa a **[http://127.0.0.1:5173/admin/audit-logs](http://127.0.0.1:5173/admin/audit-logs)**.
2. Verás la lista inmutable de todas las acciones del sistema. Cada log cuenta con un hash único **SHA-256** y un enlace al hash anterior (`previousHash`).
3. Haz clic en el botón **"Verificar Integridad de Cadena"**:
   * El sistema ejecutará el algoritmo del *Visitor* recorriendo todos los bloques para certificar que ningún registro ha sido alterado de forma fraudulenta.
   * Mostrará un banner verde confirmando que la integridad de la cadena es 100% válida.

---

## 6. Pruebas directas de Microservicios por Consola (CURL)
Si quieres saltarte la interfaz web y probar las APIs REST directamente en tu terminal, puedes ejecutar los siguientes comandos:

### A. Crear/Obtener un estudiante por email:
```bash
curl -X GET "http://127.0.0.1:3002/users/me?email=estudiante@uninorte.edu.co"
```

### B. Crear una reclamación (Simulando el DTO estricto):
*Reemplaza `userId` y `objectId` con IDs reales obtenidos de los servicios de usuarios y objetos.*
```bash
curl -X POST "http://127.0.0.1:3000/claims" \
  -H "Content-Type: application/json" \
  -H "x-user-id: [ID_DE_ESTUDIANTE]" \
  -H "x-user-role: STUDENT" \
  -d '{
    "userId": "[ID_DE_ESTUDIANTE]",
    "objectId": "[ID_DE_OBJETO]",
    "objectCategory": "ELECTRONIC",
    "lostLocation": "Biblioteca 2do Piso",
    "evidences": [
      {
        "type": "SERIAL_NUMBER",
        "description": "C02FG821Q05D"
      }
    ]
  }'
```

### C. Verificar Integridad de la cadena de auditoría:
```bash
curl -X GET "http://127.0.0.1:3001/audit-log/verify-integrity"
```
