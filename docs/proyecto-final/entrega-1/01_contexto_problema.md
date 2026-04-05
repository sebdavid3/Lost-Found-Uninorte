# 6.1 Contexto del problema

Estado: LISTO PARA REVISION
Responsable: TBD
Fecha de actualizacion: 2026-04-05

## Descripcion clara del problema

El sistema actual gestionado por Bienestar Universitario es un proceso manual y desarticulado que presenta deficiencias criticas:

- Busqueda ineficiente: La organizacion basada en carpetas en la nube obliga a realizar inspecciones visuales archivo por archivo.
- Informacion incompleta: Los registros carecen de descripciones detalladas, fotografias de alta calidad y fechas precisas de perdida/hallazgo.
- Nula trazabilidad: No existe historial para rastrear el objeto desde que se reporta hasta su entrega o disposicion final.
- Validacion presencial obligatoria: El proceso de reclamacion no tiene filtros de seguridad previos, generando carga administrativa innecesaria.

## Alcance de la solucion

La propuesta contempla el desarrollo de una plataforma web (MVP) que incluye:

### Incluye
- Catalogo digital interactivo con filtros por categoria, ubicacion y fecha.
- Modulo de registro con captura de fotos, fichas tecnicas y generacion de ID unico para indexacion fisica.
- Sistema de reclamacion digital para cargar evidencias de propiedad (fotos, facturas) antes de la validacion presencial.
- Panel administrativo para gestion de inventario, validacion de entregas, cierre de registros y estadisticas.

### No incluye (fuera de alcance)
- Integraciones institucionales no priorizadas para el MVP.
- Automatizaciones avanzadas fuera del flujo principal de registro, reclamacion, validacion y cierre.

## Supuestos

- La comunidad universitaria cuenta con dispositivos moviles y acceso a internet para consultar y reportar hallazgos.
- Existe infraestructura fisica (estantes, bodegas) organizada con el esquema de indexacion propuesto.
- La administracion universitaria garantiza respaldo institucional y recursos para la operacion.

## Restricciones

- Politicas de descarte: Todo objeto no reclamado durante el semestre inicia proceso de donacion o eliminacion.
- Seguridad de datos: El acceso administrativo esta restringido a personal autorizado mediante credenciales.
- Privacidad: La informacion de reclamantes debe protegerse bajo normativas de seguridad basica.
- Tecnologia: El sistema debe operar bajo la arquitectura definida por el proyecto para asegurar escalabilidad.

## Justificacion de la propuesta

- Optimizacion operativa: Reduccion del tiempo administrativo dedicado a busquedas manuales.
- Mejora de experiencia de usuario: Facilita autoservicio y aumenta probabilidad de recuperacion de pertenencias.
- Transparencia institucional: Genera evidencias digitales de cada entrega y reportes estadisticos para decisiones basadas en datos.

### Checklist de cierre
- [x] Problema descrito con contexto real.
- [x] Alcance delimitado (incluye/excluye).
- [x] Supuestos y restricciones claros.
- [x] Justificacion tecnica y de negocio.
