---
inclusion: manual
---

# Next.js Conventions

## App Router Fundamentals

- Use Server Components by default — add `'use client'` only when needed
- Async Server Components for data fetching (no useEffect)
- Use Server Actions for mutations
- Proper `loading.tsx`, `error.tsx`, and `not-found.tsx` boundaries for every route segment
- Use route handlers (`route.ts`) for API endpoints
- `params` and `searchParams` are Promises in Next.js 15+ — always `await` them

### File Conventions

```
app/
├── layout.tsx          # Shared UI wrapper (persists across navigations)
├── page.tsx            # Route UI
├── loading.tsx         # Loading UI (Suspense boundary)
├── error.tsx           # Error boundary ('use client' required)
├── not-found.tsx       # 404 UI
├── route.ts            # API endpoint
├── template.tsx        # Re-mounted layout (resets state on navigation)
├── default.tsx         # Parallel route fallback
└── opengraph-image.tsx # OG image generation
```

### File Structure

- `app/` for routes
- `components/` for shared components
- `lib/` for utilities and helpers
- `types/` for shared TypeScript types
- `actions/` for Server Actions

## Server/Client Component Boundaries

Push `'use client'` as deep in the tree as possible. The directive creates a boundary — everything imported by a Client Component becomes client-side code.

### When to Use Server Components (Default)
- Fetching data from databases or APIs
- Accessing server-side resources (file system, env vars)
- Rendering static content without interactivity
- Keeping sensitive logic (API keys, DB queries) on the server

### When to Use Client Components
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- React hooks (`useState`, `useEffect`, `useRef`, `useContext`)
- Browser-only APIs (`window`, `document`, `localStorage`)
- Third-party libraries that use hooks or browser APIs

```typescript
// ❌ Bad: Entire page marked as client when only a button needs interactivity
'use client';
export default async function ProductPage({ params }) { /* ... */ }

// ✅ Good: Server Component with isolated Client Component
// app/products/[id]/page.tsx (Server Component)
import { AddToCartButton } from './add-to-cart-button';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  return (
    <div>
      <h1>{product.name}</h1>
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// app/products/[id]/add-to-cart-button.tsx (Client Component)
'use client';
export function AddToCartButton({ productId }: { productId: string }) {
  return <button type="button" onClick={() => addToCart(productId)}>Add to Cart</button>;
}
```

### Data Passing Patterns

- Server → Client via serializable props only (no functions, Dates, Maps)
- Use the children pattern to keep Server Components inside Client wrappers
- Use `server-only` package to prevent accidental imports in Client Components

```typescript
// Children pattern: Server Components inside Client wrapper
'use client';
const Accordion = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)}>Toggle</button>
      {open && children}
    </div>
  );
};

// Server Component using client wrapper — children stay on server
export default async function FAQ() {
  const faqs = await getFAQs();
  return (
    <Accordion>
      {faqs.map(faq => <FAQItem key={faq.id} faq={faq} />)}
    </Accordion>
  );
}
```

## Data Fetching

### Parallel Data Fetching — Avoid Waterfalls

```typescript
// ❌ Sequential — creates waterfall
const user = await getUser();
const orders = await getOrders(user.id);
const analytics = await getAnalytics(user.id);

// ✅ Parallel — fetch independent data together
const user = await getUser();
const [orders, analytics] = await Promise.all([
  getOrders(user.id),
  getAnalytics(user.id),
]);
```

### Streaming with Suspense

Wrap independent data sections in `<Suspense>` boundaries for progressive rendering.

```typescript
export default async function DashboardPage() {
  const user = await getUser();
  return (
    <div>
      <UserHeader user={user} />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersSection userId={user.id} />
      </Suspense>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsSection userId={user.id} />
      </Suspense>
    </div>
  );
}

// Each component fetches its own data — streams independently
async function OrdersSection({ userId }: { userId: string }) {
  const orders = await getOrders(userId);
  return <OrderList orders={orders} />;
}
```

## Caching Strategies

```typescript
// No cache (always fresh)
fetch(url, { cache: 'no-store' });

// Cache forever (static)
fetch(url, { cache: 'force-cache' });

// ISR — revalidate after N seconds
fetch(url, { next: { revalidate: 3600 } });

// Tag-based invalidation
fetch(url, { next: { tags: ['products'] } });
```

### On-Demand Revalidation

Prefer `revalidateTag`/`revalidatePath` over time-based revalidation when possible.

```typescript
'use server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function updateProduct(id: string, data: ProductData) {
  await db.product.update({ where: { id }, data });
  revalidateTag(`product-${id}`);
  revalidatePath('/products');
}
```

### Static Generation

Use `generateStaticParams` for pages with known parameters at build time.

```typescript
export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}
```

## Logging

Use the correct logger for the execution context — mixing them up causes runtime errors or silent failures.

| Context | Import | Usage |
|---|---|---|
| Client Components, hooks, browser code | `clientLogger` from `@monorepo/packages-logger` | `clientLogger.error(...)` |
| Server Actions, Server Components, API routes | `serverLogger` from `@monorepo/packages-logger` | `serverLogger.error(...)` |

```typescript
// ✅ Server action — use serverLogger
'use server';
import { serverLogger } from '@monorepo/packages-logger';

export async function myAction() {
  try { /* ... */ } catch (error) {
    serverLogger.error('[myAction] Error:', error);
    throw error;
  }
}

// ✅ Client hook — use clientLogger
import { clientLogger } from '@monorepo/packages-logger';

export function useMyHook() {
  clientLogger.warn('something happened');
}
```

> Never use `createClientLogger` or `clientLogger` inside `"use server"` files.

## Server Actions

Always validate inputs, check authorization, and handle errors.

```typescript
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const deleteUserSchema = z.object({ id: z.string().uuid() });

export async function deleteUser(rawData: { id: string }) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const { id } = deleteUserSchema.parse(rawData);
  await db.user.delete({ where: { id } });
  revalidatePath('/admin/users');
}
```

### Optimistic Updates

```typescript
'use client';
import { useOptimistic } from 'react';

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function addTodo(formData: FormData) {
    const title = formData.get('title') as string;
    addOptimistic({ id: 'temp', title, completed: false });
    await createTodo(formData);
  }

  return (
    <form action={addTodo}>
      <input name="title" />
      <button type="submit">Add</button>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </form>
  );
}
```

## Route Handlers (API Routes)

Validate input early, return proper status codes, handle errors.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = createUserSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
  }

  const user = await createUser(result.data);
  return NextResponse.json(user, { status: 201 });
}
```

## Middleware

Scope middleware to specific routes. Keep it fast — no heavy computation or DB queries.

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

// ❌ Bad: Missing matcher — runs on ALL routes including static assets
// ✅ Good: Scoped to specific routes
export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
```

## Metadata & SEO

Use `generateMetadata` for dynamic pages. Always include Open Graph and Twitter card data.

```typescript
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      images: [product.image],
    },
  };
}
```

## Parallel Routes

Use for independent sections with their own loading/error states.

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="dashboard-grid">
      <main>{children}</main>
      <aside>{analytics}</aside>
      <aside>{team}</aside>
    </div>
  );
}

// app/dashboard/@analytics/page.tsx — loads independently
// app/dashboard/@analytics/loading.tsx — own loading state
// app/dashboard/@team/page.tsx — loads independently
```

## Intercepting Routes (Modal Pattern)

```
app/
├── @modal/
│   ├── (.)photos/[id]/page.tsx  # Intercept (modal)
│   └── default.tsx
├── photos/
│   └── [id]/page.tsx            # Full page (direct navigation)
└── layout.tsx                   # Renders {children} + {modal}
```

## Context Providers

Wrap third-party providers in a dedicated Client Component at the layout level.

```typescript
// app/providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class" defaultTheme="system">{children}</ThemeProvider>;
}

// app/layout.tsx (Server Component)
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

## Custom Hooks

Custom hooks belong in their own files — never define them inline inside component files.

### File Location (Database App)

| Hook type | Directory | Example |
|---|---|---|
| Data-fetching hooks (useQuery, useMutation) | `domains/{domain}/api-hooks/` | `useActivityLog.ts` |
| Non-data hooks (local state, UI logic) | `domains/{domain}/hooks/` | `useScheduleForm.ts` |

### Naming Convention

- File name matches the hook: `use{HookName}.ts`
- One hook per file
- Named export (not default)

```typescript
// ❌ Bad: Hook defined inline in a component file
// SomeModal.tsx
function useMyData() { /* ... */ }
export function SomeModal() { /* uses useMyData */ }

// ✅ Good: Hook in its own file
// domains/connector-list/api-hooks/useMyData.ts
export function useMyData() { /* ... */ }

// SomeModal.tsx
import { useMyData } from '@/domains/connector-list/api-hooks/useMyData';
export function SomeModal() { /* uses useMyData */ }
```


## Custom Hooks

Custom hooks belong in their own files — never define them inline inside component files.

### File Location (Database App)

| Hook type | Directory | Example |
|---|---|---|
| Data-fetching hooks (useQuery, useMutation) | `domains/{domain}/api-hooks/` | `useActivityLog.ts` |
| Non-data hooks (local state, UI logic) | `domains/{domain}/hooks/` | `useScheduleForm.ts` |

### Naming Convention

- File name matches the hook: `use{HookName}.ts`
- One hook per file
- Named export (not default)

```typescript
// ❌ Bad: Hook defined inline in a component file
// SomeModal.tsx
function useMyData() { /* ... */ }
export function SomeModal() { /* uses useMyData */ }

// ✅ Good: Hook in its own file
// domains/connector-list/api-hooks/useMyData.ts
export function useMyData() { /* ... */ }

// SomeModal.tsx
import { useMyData } from '@/domains/connector-list/api-hooks/useMyData';
export function SomeModal() { /* uses useMyData */ }
```
