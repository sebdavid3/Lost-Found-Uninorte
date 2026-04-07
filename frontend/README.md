# Lost & Found Uninorte - Frontend

Interfaz web para el sistema Lost & Found Uninorte, desarrollada con React y Vite.

## Tecnologías
- Framework: React + TypeScript
- Bundler: Vite
- Estilos: Tailwind CSS
- Iconos: Lucide React
- Estado/API: Fetch API & Custom Hooks

## Patrones de Diseño Implementados
- Proxy: DataProtectionProxy para manejar la visibilidad de datos sensibles según el rol.
- Factory: ClaimFormFactory para renderizar formularios dinámicos de evidencias.
- Composition: Uso intensivo de componentes funcionales y slots.

## Ejecución
Para instrucciones detalladas de ejecución y configuración, por favor consulta el [README principal en la raíz del proyecto](../README.md).

```bash
# Variables de entorno
cp .env.example .env

# Instalación
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build
```

## Variables de entorno
- `VITE_API_BASE_URL`: URL base completa de la API (ejemplo: `http://localhost:3000`).
- `VITE_API_PORT`: alternativa opcional si no defines URL base completa.
