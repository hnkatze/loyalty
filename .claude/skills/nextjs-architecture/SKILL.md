# Next.js 16 Architecture Patterns

## Project Structure (App Router)

```
app/
├── (auth)/                    # Route group - public auth pages
│   ├── login/page.tsx
│   ├── register/
│   │   ├── owner/page.tsx
│   │   └── client/page.tsx
│   └── layout.tsx             # Auth layout (no navbar)
├── (owner)/                   # Route group - owner dashboard
│   ├── dashboard/page.tsx
│   ├── clientes/page.tsx
│   ├── servicios/page.tsx
│   ├── empleados/page.tsx
│   ├── agenda/page.tsx
│   ├── recompensas/page.tsx
│   ├── reportes/page.tsx
│   ├── configuracion/page.tsx
│   └── layout.tsx             # Owner layout (sidebar + navbar)
├── (client)/                  # Route group - client app
│   ├── dashboard/page.tsx
│   ├── reservas/page.tsx
│   ├── recompensas/page.tsx
│   ├── historial/page.tsx
│   ├── perfil/page.tsx
│   └── layout.tsx             # Client layout (bottom nav)
├── api/                       # API Routes
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── register-owner/route.ts
│   │   └── register-client/route.ts
│   └── establish/[estId]/     # Dynamic routes per establishment
│       ├── clients/route.ts
│       ├── services/route.ts
│       └── appointments/route.ts
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page
├── loading.tsx                # Global loading
├── error.tsx                  # Global error
└── not-found.tsx              # 404 page

components/
├── auth/                      # Auth-related components
├── owner/                     # Owner dashboard components
├── client/                    # Client app components
├── common/                    # Shared components (Navbar, Sidebar)
└── ui/                        # Base UI components (Button, Card, Input)

lib/
├── firebase/
│   ├── client.ts              # Firebase client SDK init
│   ├── admin.ts               # Firebase Admin SDK init
│   └── firestore/             # Firestore CRUD functions
├── auth/
│   ├── session.ts             # Session management
│   └── middleware.ts          # Auth middleware helpers
├── validators/                # Input validation functions
└── utils/                     # Utility functions

types/                         # TypeScript interfaces
hooks/                         # Custom React hooks
context/                       # React Context providers
```

## Server Components vs Client Components

### Server Components (Default)
- No `'use client'` directive needed
- Can be async functions
- Can directly access databases, file system
- Cannot use hooks, event handlers, browser APIs

```tsx
// app/(owner)/clientes/page.tsx - Server Component
import { getClients } from '@/lib/firebase/firestore/clients'

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div>
      <h1>Clientes</h1>
      <ClientList clients={clients} />
    </div>
  )
}
```

### Client Components
- Must have `'use client'` at top
- Can use hooks (useState, useEffect)
- Can handle events (onClick, onChange)
- Can access browser APIs

```tsx
'use client'
// components/owner/ClientList.tsx - Client Component

import { useState } from 'react'

export function ClientList({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar cliente..."
      />
      {filtered.map(client => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  )
}
```

## Route Groups

Route groups `(groupName)` organize routes without affecting URL:

```
app/(auth)/login/page.tsx     → /login
app/(owner)/dashboard/page.tsx → /dashboard
app/(client)/reservas/page.tsx → /reservas
```

Each group can have its own layout:

```tsx
// app/(owner)/layout.tsx
export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

## Dynamic Routes

```tsx
// app/api/establish/[estId]/clients/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ estId: string }> }
) {
  const { estId } = await params
  const clients = await getClientsByEstablishment(estId)
  return Response.json(clients)
}
```

## Layouts

```tsx
// app/layout.tsx - Root Layout
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'Loyalty App',
  description: 'Sistema de puntos y reservas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={geist.className}>{children}</body>
    </html>
  )
}
```

## Loading States

```tsx
// app/(owner)/clientes/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}
```

## Error Handling

```tsx
'use client'
// app/(owner)/clientes/error.tsx

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold text-red-600">Algo salió mal</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
```

## Metadata & SEO

```tsx
// app/(owner)/clientes/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clientes | Loyalty',
  description: 'Gestiona tus clientes',
}

export default function ClientesPage() {
  // ...
}
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | `page.tsx` | `app/(owner)/clientes/page.tsx` |
| Layouts | `layout.tsx` | `app/(owner)/layout.tsx` |
| Loading | `loading.tsx` | `app/(owner)/clientes/loading.tsx` |
| Error | `error.tsx` | `app/(owner)/clientes/error.tsx` |
| API Routes | `route.ts` | `app/api/clients/route.ts` |
| Components | PascalCase | `ClientCard.tsx` |
| Hooks | camelCase with use | `useClients.ts` |
| Utils | camelCase | `formatDate.ts` |
