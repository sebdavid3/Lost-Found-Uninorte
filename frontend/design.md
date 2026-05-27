# Design System — Lost & Found Uninorte

> Basado en el sistema de diseño de Cohere (referencia de lenguaje visual para el nuevo frontend).

---

## Overview

El sistema busca transmitir **control, claridad y confianza** — valores de una institución universitaria gestionando objetos perdidos. La interfaz evita lo decorativo y usa el color con intención: llega a través de fotografía de objetos, badges de estado, y bandas de color institucional, no como adorno de UI.

**Características clave:**
- Tipografía display monumental con interlineado muy ajustado y tracking negativo.
- Lienzos blancos interrumpidos por bandas de color institucional (verde Uninorte, azul oscuro).
- Tarjetas redondeadas (8px a 22px), botones pill en near-black o blanco.
- Fotografía de objetos como portadora de color; el esqueleto de UI se mantiene sobrio.
- Sistema de estados claro: badges de color para PENDING, APPROVED, REJECTED.

---

## Colores

### Marca e Institucionales

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-black` | `#000000` | Texto de alto contraste, barra de anuncios, ancla de marca |
| `--color-near-black` | `#17171c` | Botones primarios, footer oscuro |
| `--color-green` | `#003c33` | Verde institucional Uninorte — bandas de producto/hero |
| `--color-navy` | `#071829` | Secciones de solución (seguridad, datos) |
| `--color-blue` | `#1863dc` | Links editoriales, acentos secundarios |
| `--color-coral` | `#ff7759` | Badges de categoría, chips de taxonomy, marcadores cálidos |
| `--color-soft-coral` | `#ffad9b` | Bordes de chip suaves, detalles de etiqueta |

### Superficies y Fondos

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-white` | `#ffffff` | Fondo de página dominante, tarjetas, formularios |
| `--color-stone` | `#eeece7` | Tarjetas de producto, placeholders testimoniales |
| `--color-green-wash` | `#edfce9` | Fondos de sección detrás de paneles de capacidad |
| `--color-blue-wash` | `#f1f5ff` | Superficies de CTA editorial |
| `--color-card-border` | `#f2f2f2` | Línea de contención más suave |

### Texto y Reglas

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-ink` | `#212121` | Texto body por defecto, links en fondo claro |
| `--color-muted` | `#93939f` | Footer links, fechas, metadata, labels |
| `--color-slate` | `#75758a` | Separadores de investigación, texto terciario |
| `--color-hairline` | `#d9d9dd` | Reglas de lista y divisores de sección |
| `--color-border-light` | `#e5e7eb` | Divisores secundarios |

### Estado (Claims)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-pending` | `#f59e0b` | Badge "Pendiente" — amarillo ámbar |
| `--color-approved` | `#10b981` | Badge "Aprobado" — verde esmeralda |
| `--color-rejected` | `#ef4444` | Badge "Rechazado" — rojo |
| `--color-info` | `#3b82f6` | Badge informativo — azul |

### Gradientes

No se usan gradientes como relleno genérico de UI. Reserve gradientes para:
- Imágenes de hero abstractas
- Posters de video de producto
- Bandas oscuras de CTA

Mantenga las superficies de UI planas.

---

## Tipografía

### Familias

| Rol | Fuente | Fallback |
|-----|--------|----------|
| Display | `Unica77` / `Space Grotesk` | `Inter`, `ui-sans-serif`, `system-ui` |
| Body/UI | `Inter` | `Arial`, `ui-sans-serif`, `system-ui` |
| Mono (técnico) | `JetBrains Mono` / `Fira Code` | `monospace` |

### Jerarquía

| Rol | Font | Size | Weight | Line H | Letter Spacing | Notas |
|-----|------|-----:|------:|-------:|---------------:|-------|
| Hero Display | Space Grotesk | 72px | 500 | 1.00 | -1.44px | Título principal del home |
| Section Display | Space Grotesk | 48px | 500 | 1.00 | -0.96px | Encabezados de sección grande |
| Section Heading | Inter | 36px | 600 | 1.20 | -0.36px | Encabezados de página |
| Card Heading | Inter | 24px | 600 | 1.25 | 0 | Títulos de tarjeta |
| Feature Heading | Inter | 20px | 600 | 1.30 | 0 | Subtítulos de feature |
| Body Large | Inter | 18px | 400 | 1.50 | 0 | Texto lead, párrafos grandes |
| Body | Inter | 16px | 400 | 1.60 | 0 | Texto por defecto |
| Button | Inter | 14px | 600 | 1.50 | 0.5px | Labels de botones |
| Caption | Inter | 14px | 400 | 1.40 | 0 | Metadatos, texto pequeño |
| Mono Label | JetBrains Mono | 13px | 500 | 1.40 | 0.5px | Labels técnicos (uppercase) |
| Micro | Inter | 12px | 400 | 1.40 | 0 | Footer, nav microcopy |

### Principios

- Use tipografía grande con moderación: una sola headline sobredimensionada por página, luego texto contenido en 14px-18px.
- Mantenga la display type ajustada. El hero debe sentirse compacto y tallado, no aireado.
- Evite bold pesados. El tamaño, el espaciado y el contraste de superficie hacen el trabajo de jerarquía.
- Use labels mono uppercase para marcadores de categoría y sistema.
- Badges de estado (PENDING, APPROVED, REJECTED) en bold, con color semántico.

---

## Layout

### Sistema de Espaciado

Base de 8px: `2`, `4`, `6`, `8`, `10`, `12`, `16`, `20`, `24`, `28`, `32`, `36`, `40`, `48`, `56`, `64`, `80`, `96`, `128`.

Secciones grandes usan espacio vertical dramático. El home page coloca el hero, luego una trust-logo strip muy separada, luego features, luego CTA.

### Grid

- Nav: logo izquierda, menú centrado, CTA derecha
- Hero: texto centrado sobre composición de medios (2 cards: mockup + fotografía)
- Features: 3 columnas en desktop, 2 en tablet, 1 en mobile
- Admin panels: layout de 2 columnas (sidebar + contenido principal)
- Formularios: inputs en filas de 2 columnas dentro de tarjeta blanca

### Filosofía de Whitespace

El espacio vacío es una señal de confianza. Intervalos grandes separan: propuesta de valor, prueba social, features, CTA. Contenido denso solo donde sirve a la arquitectura de información (tablas de claims, grids de objetos).

---

## Elevación y Profundidad

Cohere es mayormente plano. La profundidad viene de alternancia de superficie, contraste de medios, esquinas redondeadas y bordes delgados, no de sombras.

| Nivel | Tratamiento | Uso |
|-------|------------|-----|
| Flat | Sin sombra, campo blanco u oscuro | Hero copy, listas, superficies editoriales |
| Bordered | 1px `#d9d9dd` o `#e5e7eb` | Filas de tabla, formularios, tarjetas pálidas |
| Media Lift | Imagen redondeada sobre sección de color contrastante | Hero photo cards, CTA imagery |
| Dark Field | Banda verde oscuro o azul marino full-width | Secciones de feature oscuras |

---

## Shapes

### Escala de Radios

| Token | Value | Uso |
|-------|-----:|-----|
| `xs` | 4px | Imágenes pequeñas, campos de búsqueda, thumbnails |
| `sm` | 8px | Badges, tarjetas pequeñas, media |
| `md` | 12px | Tajetas de objeto, modales |
| `lg` | 16px | Tarjetas de producto grandes |
| `xl` | 20px | Placeholders de media signature |
| `pill` | 24px | Botones primarios CTA |
| `full` | 9999px | Elementos de estado redondos, avatares |

### Imágenes

Las imágenes de objetos deben mostrarse como tarjetas redondeadas con esquinas visibles (radio 8px-16px). No usar imágenes como backdrop decorativo de texto excepto en bandas de CTA.

---

## Componentes

### `button-primary`
Botón pill near-black o blanco (según contraste de superficie). 14px Inter semibold, padding 12px 24px, radio 24px. Acción principal.

### `button-secondary`
Link de texto con underline, sin fondo. Para acciones secundarias.

### `badge-status`
Badge pequeño con color semántico:
- `PENDING` → fondo amarillo ámbar, texto oscuro
- `APPROVED` → fondo verde esmeralda, texto blanco
- `REJECTED` → fondo rojo, texto blanco

### `object-card`
Tarjeta de objeto perdido con:
- Foto redondeada (radio 8px)
- Nombre del objeto
- Categoría (coral chip)
- Fecha encontrado
- Ubicación
- Estado (AVAILABLE / CLAIMED)

### `claim-card`
Tarjeta de reclamo con:
- Objeto reclamado (foto + nombre)
- Fecha del reclamo
- Badge de estado
- Evidencias (miniaturas)
- Razón de rechazo (si aplica)

### `announcement-bar`
Barra full-width negra sobre el nav, 36px alto, microcopy centrado con link "Saber más" y botón de cerrar.

### `trust-logo-strip`
Fila de logos de dependencias universitarias en monocromo, sin bordes ni tarjetas, con amplio espaciado horizontal.

### `search-field`
Input de búsqueda con icono de lupa, radio 8px, borde sutil. Input de texto con padding 10px 16px.

### `pagination`
Controles Anterior/Siguiente + números de página. Número activo destacado.

### `modal`
Diálogo overlay con:
- Backdrop semitransparente
- Cierre con Escape, click outside, y botón X
- Focus trap
- Animación fade + scale (200ms)
- Padding 24px, radio 16px

### `skeleton`
Placeholder animado (pulse) para estados de carga:
- `SkeletonCard` → 300px x 400px con imagen + texto
- `SkeletonRow` → fila de tabla
- `SkeletonText` → línea de texto

### `toast`
Notificación no intrusiva:
- Esquina superior derecha
- Tipos: success (verde), error (rojo), info (azul)
- Auto-dismiss 4s (error requiere clic)
- Cola de múltiples toasts

### `confirm-modal`
Modal de confirmación con:
- Título de la acción
- Descripción del impacto
- Botón Cancelar (secondary)
- Botón Confirmar (primary, rojo si es destructivo)
- Si es rechazo: incluir campo de texto para razón

---

## Do's and Don'ts

### Do
- Usar fondo blanco como superficie default; introducir bandas de color institucional (verde, azul) secciones completas
- Mantener CTAs primarios en near-black pill sobre fondo claro
- Usar radio 12-16px en tarjetas de objeto
- Usar coral para badges de categoría, no como sistema CTA principal
- Usar badges de estado con color semántico (ámbar, verde, rojo)
- Dejar que las fotos de objetos carguen el color; el shell de UI se mantiene sobrio

### Don't
- No convertir coral o azul en colores decorativos de superficie
- No agregar sombras pesadas a tarjetas
- No hacer que cada sección sea card-based; usar filas sin marco y espacio abierto
- No usar radios menores a 8px para tarjetas principales
- No usar gradientes saturados como fondos de UI normales

---

## Breakpoints Responsive

| Name | Width | Cambios clave |
|------|-----:|---------------|
| Small Mobile | <425px | Una columna, nav compacto, hero reducido |
| Mobile | 425-640px | Hero apila, grids 1 columna, formularios apilan |
| Tablet | 768-1024px | 2 columnas, espaciado de nav se ajusta |
| Desktop | 1024-1440px | Nav completo, 3 columnas, hero dividido |
| Large Desktop | 1440-2560px | Contenedores anchos, grandes intervalos verticales |

### Touch Targets
CTAs y pills con padding 12px-24px. Badges y chips de filtro más grandes que tags estándar.

---

## Archivos de implementación esperados

| Archivo | Propósito |
|---------|-----------|
| `tailwind.config.ts` | Tokens de diseño (colores, radios, tipografía, breakpoints) |
| `src/index.css` | Variables CSS personalizadas, estilos base |
| `src/components/ui/Button.tsx` | `button-primary` y `button-secondary` |
| `src/components/ui/Badge.tsx` | `badge-status` para estados de claim |
| `src/components/ui/Modal.tsx` | Modal reusable con overlay, focus trap, animación |
| `src/components/ui/Skeleton.tsx` | Componente de skeleton loading |
| `src/components/ui/Toast.tsx` | Sistema de notificaciones toast |
| `src/components/ui/Pagination.tsx` | Controles de paginación |
| `src/components/ui/SearchField.tsx` | Input de búsqueda con lupa |
| `src/components/ui/ConfirmModal.tsx` | Modal de confirmación |
| `src/components/ui/EmptyState.tsx` | Estado sin datos |
| `src/components/ui/ErrorState.tsx` | Estado de error con retry |
| `src/components/ui/Spinner.tsx` | Spinner SVG |
| `src/components/ui/LoadingButton.tsx` | Botón con estado loading |
