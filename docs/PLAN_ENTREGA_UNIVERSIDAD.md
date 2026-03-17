# Plan de Acción y Entrega: Sistema Lost & Found Uninorte

**Contexto:** Asumiendo que la arquitectura base ya ha sido migrada a un enfoque de Microservicios con Clean Architecture, actualmente la funcionalidad más desarrollada es la **Creación y Validación de Reclamaciones**. Para poder entregar un Producto Mínimo Viable (MVP) funcional y completo a la Universidad del Norte, es necesario desarrollar el resto de los flujos críticos del sistema.

Este documento detalla la hoja de ruta para completar el desarrollo y llevar el proyecto a un entorno de producción real.

---

## Fase 1: Consolidación del Core y Servicios Faltantes (Semanas 1-3)

Dado que las reclamaciones (Claims Service) ya tienen su lógica avanzada, debemos habilitar los servicios de los que depende para operar en un entorno real.

### 1.1 Identity Service (Autenticación y Usuarios)
Actualmente la seguridad se simula con headers (`x-user-id`, `x-user-role`). Para la universidad, esto debe ser seguro.
*   **Integración de Autenticación:** Implementar JWT. Idealmente, integrar SSO (Single Sign-On) con el directorio activo de Uninorte (Google Workspace / Microsoft Entra ID) usando OAuth2 para que los estudiantes usen su correo institucional (`@uninorte.edu.co`).
*   **Gestión de Roles:** Asegurar los roles `STUDENT` y `ADMIN` (personal de la universidad encargado de objetos perdidos).

### 1.2 Catalog Service (Gestión de Objetos)
Sin objetos en el sistema, no hay nada que reclamar.
*   **CRUD de Objetos:** API completa para registrar un objeto encontrado (fecha, ubicación, categoría, descripción).
*   **Almacenamiento de Imágenes:** Implementar subida de imágenes reales a un Object Storage (ej. AWS S3, Cloudinary o MinIO) en lugar de URLs estáticas. La regla de negocio exige fotos obligatorias.
*   **Estados del Objeto:** Manejar la máquina de estados del objeto (`AVAILABLE`, `IN_PROCESS`, `DELIVERED`, `DISCARDED`).

### 1.3 Mejora del Claims Service
*   **Notificaciones:** Al aprobar o rechazar un reclamo, el microservicio debe emitir un evento que dispare un correo electrónico al estudiante (ej. usando SendGrid o AWS SES).
*   **Cierre del Ciclo:** Lógica para marcar un objeto como "Entregado" una vez la reclamación se aprueba y el estudiante recoge el objeto físicamente.

---

## Fase 2: Construcción del Frontend y API Gateway (Semanas 4-5)

El frontend en React/Vite debe adaptarse para comunicarse con la nueva arquitectura y brindar pantallas funcionales para ambos roles.

### 2.1 API Gateway / BFF (Backend For Frontend)
*   Desplegar un API Gateway (ej. Kong, Nginx, o un servicio proxy en Node) que unifique las rutas hacia `/auth`, `/objects` y `/claims`, manejando los tokens o sesiones.

### 2.2 Portal del Estudiante
*   **Login institucional.**
*   **Catálogo Público de Objetos:** Galería visual con filtros (categoría, rango de fechas).
*   **Formulario de Reclamación:** UI guiada (Stepper) que pida exactamente las evidencias según la categoría del objeto (usando el Abstract Factory del backend).
*   **Mis Reclamos:** Panel donde el estudiante ve el estado de sus solicitudes (`PENDING`, `APPROVED`, `REJECTED`).

### 2.3 Portal Administrativo
*   **Registro de Hallazgos:** Interfaz rápida para que el personal registre objetos encontrados, tome o suba fotos y categorice.
*   **Bandeja de Reclamaciones:** Panel para revisar la cadena de validación (identidad, disponibilidad, coincidencia de evidencias).
*   **Gestión de Entregas:** Botón final para confirmar que el estudiante se acercó a buscar el objeto y cerrar el caso.

---

## Fase 3: Infraestructura y Pase a Producción (Semana 6)

El `docker-compose.yml` base es excelente para desarrollo local, pero la universidad requerirá un despliegue formal.

*   **Despliegue Cloud:** Configurar el despliegue de los contenedores Docker en un entorno gestionado (ej. AWS ECS, Google Cloud Run, o un clúster Kubernetes provisto por la universidad).
*   **Bases de Datos Gestionadas:** Migrar la base de datos PostgreSQL en contenedor a un servicio gestionado (ej. Amazon RDS) para asegurar respaldos automáticos y alta disponibilidad.
*   **CI/CD:** Configurar flujos de trabajo en GitHub Actions para ejecutar pruebas automáticas (unitarias y E2E de Jest) y construir/desplegar las imágenes automáticamente en la nube al fusionar a `main`.
*   **Estrategia de Logs y Monitoreo:** Centralizar logs (ELK Stack o Datadog) ya que tener microservicios dificulta el rastreo de errores si no están centralizados.

---

## Fase 4: Entrega a Uninorte y Pruebas de Aceptación (Semana 7)

*   **UAT (User Acceptance Testing):** Sesiones de prueba con los trabajadores reales de objetos perdidos de la universidad en un entorno de "Staging".
*   **Ajuste de flujos reales:** Afinar detalles según el feedback (ej. "necesitamos poder exportar a Excel", "las fotos pesan mucho").
*   **Documentación Final:** Entregar manuales de usuario para el personal administrativo y la documentación técnica consolidada para el equipo de TI de la universidad.