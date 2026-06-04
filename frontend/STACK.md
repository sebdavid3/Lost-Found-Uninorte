# Frontend Stack — Desarrollo rápido con IA + buena apariencia

> **Objetivo:** Stack tecnológico optimizado para desarrollo asistido por IA, con componentes visuales pulidos out-of-the-box.

---

## Stack definitivo

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Framework | **React 19** + **TypeScript** 5.9 | Ecosistema maduro, la IA lo conoce bien |
| Build | **Vite 7** | Hot-reload instantáneo, build rápido |
| Estilos | **Tailwind CSS 4** + modo oscuro vía clase | Utility-first, iteración rápida, la IA genera clases sin pensar |
| Componentes UI | **shadcn/ui** (Radix UI + Tailwind) | Componentes bellos, accesibles, copy-paste. La IA conoce la API exacta. Se personalizan con Tailwind. |
| Routing | **React Router 7** | Ya definido, loader/action pattern |
| Estado servidor | **TanStack React Query** v5 | Elimina boilerplate loading/error/cache. La IA genera hooks `useQuery`/`useMutation` fácilmente |
| Estado global | **Zustand** | Menos boilerplate que Context. Store simple que la IA puede generar en 2 líneas |
| Formularios | **React Hook Form** + **Zod** | Validación declarativa con tipos inferidos |
| Toasts | **Sonner** | API simple, animaciones suaves, se integra con shadcn |
| Iconos | **Lucide React** | Ya definido, árbol de iconos amplio |
| Testing | **Vitest** + **React Testing Library** | Compatible Vite, rápido |
| Fecha | **date-fns** | Liviano, tree-shakeable, formateo de fechas |

---

## Por qué este stack acelera el desarrollo con IA

### shadcn/ui
- Componentes como `Button`, `Dialog`, `Sheet`, `Table`, `Card`, `Badge`, `Input`, `Select`, `Tabs`, `Skeleton` ya existen y son accesibles
- La IA (Claude, GPT) conoce la API exacta de shadcn — puedes pedir "un modal de confirmación con shadcn" y genera código correcto
- Se personaliza vía `tailwind.config.ts` y `cn()` — los tokens de diseño del `design.md` se mapean directamente
- Los componentes son copy-paste, no una dependencia oculta — total control

### TanStack React Query
- Elimina el 90% del código de estados loading/error que causó bugs en el frontend anterior
- Un `useQuery` solo:
  ```tsx
  const { data, isLoading, error } = useQuery({
    queryKey: ['objects', filters, page],
    queryFn: () => api.getObjects(filters, page),
  });
  ```
  Maneja: loading, error, refetch, caching, paginación, y no hace optimistic updates incorrectos (L2)
- Las mutations manejan invalidación automática de queries

### Zustand
- Store simple sin providers ni context wrapping:
  ```tsx
  const useAuthStore = create((set) => ({
    user: null,
    login: async (email, password) => {
      const user = await api.login(email, password);
      set({ user });
    },
  }));
  ```
- La IA genera stores enteros sin errores de boilerplate

---

## Integración con el design system

shadcn/ui se personaliza vía `tailwind.config.ts`:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          'near-black': '#17171c',
          green: '#003c33',
          navy: '#071829',
          blue: '#1863dc',
          coral: '#ff7759',
        },
        status: {
          pending: '#f59e0b',
          approved: '#10b981',
          rejected: '#ef4444',
        },
        surface: {
          stone: '#eeece7',
          'green-wash': '#edfce9',
          'blue-wash': '#f1f5ff',
        },
        ink: '#212121',
        muted: '#93939f',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        pill: '24px',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

Los componentes shadcn generados leerán estos tokens automáticamente.

---

## Instalación rápida

```bash
# 1. Crear proyecto Vite + React + TypeScript
npm create vite@latest frontend -- --template react-ts
cd frontend

# 2. Dependencias core
npm install react-router-dom @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install sonner lucide-react date-fns
npm install clsx tailwind-merge  # para cn() utility

# 3. shadcn/ui (inicializar)
npx shadcn@latest init

# 4. Componentes shadcn que vamos a usar
npx shadcn@latest add button card dialog input label select
npx shadcn@latest add table badge skeleton tabs sheet
npx shadcn@latest add separator toast dropdown-menu
npx shadcn@latest add avatar progress

# 5. Tailwind - configurar tokens de diseño
# (editar tailwind.config.ts con los colores y radios arriba)
```

---

## Convenios para desarrollo con IA

Para que la IA genere código consistente, seguir estos patrones:

### Naming de archivos
```
src/
├── components/ui/          # shadcn components + custom UI (Button.tsx, Card.tsx...)
├── components/layout/      # Navbar, Sidebar, Footer, Layouts
├── components/domain/      # ObjectCard, ClaimCard, ClaimForm...
├── hooks/                  # useDebounce, useApi...
├── lib/                    # api.ts, utils.ts, cn.ts
├── stores/                 # authStore, uiStore...
├── schemas/                # claim.schema.ts, object.schema.ts, auth.schema.ts
├── pages/                  # LoginPage, CatalogPage...
│   └── admin/             # AdminDashboardPage, AdminClaimsListPage...
├── types/                  # index.ts (enums, interfaces)
└── contexts/               # AuthContext (o usar zustand store directo)
```

### Patrón de página estándar
```tsx
// pages/CatalogPage.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ObjectCard } from '@/components/domain/object-card';
import { Pagination } from '@/components/ui/pagination';

export function CatalogPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['objects', filters, page],
    queryFn: () => api.getObjects({ ...filters, page }),
  });

  if (isLoading) return <ObjectGridSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data?.items.length) return <EmptyState message="No hay objetos perdidos" />;

  return (
    <div>
      <SearchField onSearch={...} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map(obj => <ObjectCard key={obj.id} object={obj} />)}
      </div>
      <Pagination page={page} total={data.total} onChange={setPage} />
    </div>
  );
}
```

Este patrón elimina los errores L1-L10 del frontend anterior: no hay `console.error` sin feedback, no hay optimistic updates falsos, no hay loading states faltantes, no hay mock data muerto.

---

## Resumen

| Requisito | Solución | Beneficio IA |
|-----------|----------|-------------|
| UI bella | shadcn/ui + tokens personalizados | IA conoce la API exacta |
| Estados loading/error | TanStack React Query | 0 boilerplate, no se olvida |
| Formularios | React Hook Form + Zod | Validación declarativa, tipos inferidos |
| Toasts | Sonner | Una línea, se ve bien |
| Estado global | Zustand | Sin providers, 3 líneas |
| Velocidad dev | Vite + HMR | Feedback instantáneo |
| Builder | npx shadcn add | Componentes listos en segundos |
