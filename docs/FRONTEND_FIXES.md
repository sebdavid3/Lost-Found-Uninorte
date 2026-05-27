# Frontend Fixes — Solo Arreglos (Código existente que estaba roto)

> **Proyecto:** Lost & Found Uninorte
> **Branch:** `entrega-final`
> **Propósito:** Documentar el código frontend que estaba **roto** en la versión anterior para no repetir los mismos errores en la reconstrucción.
> **Nota:** El frontend se eliminó y se reconstruirá desde cero. Este documento sirve como referencia de lo que NO hacer.

---

## Código que estaba roto y hay que evitar en la nueva versión

### FF1. Hardcoded `'current-user-id'` — flujo de creación de claims roto

**Archivo original:** `frontend/src/pages/CatalogPage.tsx:47`

**Problema:**
```ts
userId: 'current-user-id',  // ← string fijo, no es un UUID real
```
El backend ejecuta `findUnique({ where: { id: 'current-user-id' } })`, retorna `null`, y el Chain of Responsibility (IdentityHandler) falla porque el usuario no existe.

**Lección para el nuevo frontend:**
- El userId debe venir de un contexto de autenticación, no estar hardcodeado
- Nunca enviar IDs inventados al backend

---

### FF2. Optimistic update falso en Approve/Reject — estado UI desincronizado

**Archivo original:** `frontend/src/pages/AdminPanelPage.tsx:44-48, 58-62`

**Problema:**
```ts
catch (err) {
  alert('Error... (Simulando éxito para el Paso 5)');
  setClaims(prev => prev.map(c => c.id === id ? { ...c, status: ClaimStatus.APPROVED } : c));
  setSelectedClaim(null);
}
```
Ambos handlers (`handleApprove` y `handleReject`) actualizan el estado local **aunque la API falle**. El admin ve el reclamo como APPROVED/REJECTED en pantalla cuando en realidad el backend rechazó la operación.

**Lección para el nuevo frontend:**
- No hacer optimistic updates si la operación puede fallar
- En caso de error, mostrar mensaje y **no** modificar el estado local
- Usar `try/catch` correctamente: solo actualizar UI si la respuesta es exitosa

---

### FF3. `console.error` traga errores silenciosamente

**Archivos originales:**
- `frontend/src/pages/CatalogPage.tsx:23` — `console.error('Error fetching objects:', error);`
- `frontend/src/pages/CatalogPage.tsx:55` — `console.error('Error al enviar reclamación:', error);`
- `frontend/src/pages/AdminPanelPage.tsx:26` — `console.error('Error fetching claims:', err);`

**Problema:** Los errores de API solo se loguean a consola. El usuario ve exactamente el mismo estado que cuando no hay datos ("No hay objetos perdidos"), sin poder distinguir un error de un estado vacío.

**Lección para el nuevo frontend:**
- Manejar tres estados siempre: `loading`, `error`, `data`
- Mostrar mensaje de error claro con opción de reintentar
- Diferenciar visualmente "sin datos" de "error de conexión"

---

### FF4. `alert()` como único mecanismo de feedback al usuario

**Archivos originales:**
- `frontend/src/pages/AdminPanelPage.tsx:44` — `alert('Error... (Simulando éxito para el Paso 5)');`
- `frontend/src/pages/AdminPanelPage.tsx:43` — `alert('Reclamación aprobada (simulado)');`
- `frontend/src/pages/CatalogPage.tsx:57` — `alert('Error... (Simulando éxito)');`

**Problema:** Uso generalizado de `alert()` para notificar al usuario. Es intrusivo, no tiene diseño, y no escala.

**Lección para el nuevo frontend:**
- Implementar sistema de toast/notificaciones no intrusivas
- Usar modales solo para confirmaciones o detalles importantes

---

### FF5. JSON parse error silencioso en API client

**Archivo original:** `frontend/src/services/api.ts:40`

**Problema:**
```ts
const data = await response.json().catch(() => ({}));
```
Si el servidor devuelve una respuesta no-JSON (ej. HTML de error, 502), el `catch` retorna `{}` silenciosamente. El código aguas arriba recibe un objeto vacío como si todo estuviera bien.

**Lección para el nuevo frontend:**
- Validar que la respuesta sea JSON antes de parsear
- Verificar `response.ok` antes de extraer el body
- No tragar errores silenciosamente

---

### FF6. Mock data (`mockData.ts`) nunca se usaba

**Archivo original:** `frontend/src/services/mockData.ts` (56 líneas)

**Problema:** Archivo completo de mock data exportado pero nunca importado en ningún componente. Código muerto.

**Lección para el nuevo frontend:**
- No incluir mock data en el bundle de producción
- Usar MSW (Mock Service Worker) o archivos condicionales si se necesitan mocks en desarrollo

---

### FF7. Enums usados como strings literales

**Archivos originales:**
- `AdminPanelPage.tsx:112,123` — `'PENDING'` en vez de `ClaimStatus.PENDING`
- `AdminClaimTable.tsx:13-18` — `'APPROVED'`, `'REJECTED'` como strings
- `DataProtectionProxy.tsx:24` — `'ADMIN'` en vez de `Role.ADMIN`

**Problema:** Strings mágicos scattered por el código. Si el enum cambia, estos strings no se actualizan. Sin autocompletado ni type safety.

**Lección para el nuevo frontend:**
- Usar siempre los enums/types importados del sistema de tipos compartido
- Nunca escribir strings directamente donde hay un enum disponible

---

### FF8. Componente `ClaimFormFactory.tsx` desbalanceado

**Archivo original:** `frontend/src/patterns/ClaimFormFactory.tsx`

**Problema:** Solo 2 ramas: `ELECTRONIC` y un default que agrupa las otras 6 categorías (`CLOTHING`, `STATIONERY`, `DOCUMENT`, `ACCESSORY`, `OTHER`, `COMMON`). La mayoría de categorías reciben el mismo tratamiento genérico.

**Lección para el nuevo frontend:**
- Si se implementa Abstract Factory de nuevo, balancear las categorías o eliminar si no hay diferenciación real
- Mantener solo lo que aporta valor al negocio

---

### FF9. `via.placeholder.com` como fallback de imágenes — dependencia externa

**Archivo original:** `frontend/src/components/LostObjectCard.tsx:56-62`

**Problema:** El fallback de imágenes rotas usa `via.placeholder.com`, un servicio externo que puede no estar disponible en todos los entornos.

**Lección para el nuevo frontend:**
- Usar un placeholder inline (CSS/SVG) o un componente de placeholder local
- No depender de servicios externos para el correcto funcionamiento visual

---

### FF10. Sin estados de carga en botones de acción

**Archivos originales:**
- `frontend/src/components/ClaimForm.tsx` — botón "Enviar Reclamación" sin loading
- `frontend/src/components/ClaimDetailModal.tsx:146-159` — botones Approve/Reject sin loading

**Problema:** El usuario puede hacer clic múltiples veces, enviando requests duplicados. Sin feedback visual de que la operación está en progreso.

**Lección para el nuevo frontend:**
- Todo botón que dispara una operación asíncrona debe tener estado `isLoading`
- Deshabilitar el botón durante la operación
- Mostrar spinner o indicador visual

---

## Resumen de errores a evitar

| # | Problema | Impacto | Solución en nuevo frontend |
|---|----------|---------|---------------------------|
| FF1 | `'current-user-id'` hardcodeado | Flujo de claims roto | AuthContext con userId real |
| FF2 | Optimistic update en catch | UI desincronizada con backend | Solo actualizar en éxito |
| FF3 | console.error sin feedback | Usuario no sabe que hay error | Estado `error` + mensaje + retry |
| FF4 | `alert()` | UX pobre, intrusivo | Sistema de toasts |
| FF5 | JSON parse silent catch | Datos corruptos pasan inadvertidos | Validar response.ok y content-type |
| FF6 | mockData.ts muerto | Código innecesario en bundle | No incluir, o usar MSW condicional |
| FF7 | Strings en vez de enums | Sin type safety | Siempre importar enums |
| FF8 | Factory desbalanceada | Categorías sin diferenciación | Rediseñar o eliminar |
| FF9 | via.placeholder.com externo | Fallback puede fallar | Placeholder inline local |
| FF10 | Sin loading en botones | Requests duplicados | Estado isLoading + disabled |
