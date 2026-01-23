---
name: nextjs-page-generator
description: Generates Next.js pages, layouts, loading and error states. Use proactively when creating new pages in app/ directory.
tools: Read, Write, Glob, Grep, Bash
model: sonnet
skills:
  - nextjs-architecture
  - react-components
  - typescript-standards
---

# nextjs-page-generator

Genera páginas Next.js completas (Server/Client Components, layouts, API routes) siguiendo la arquitectura App Router del proyecto.

## Cuándo usar este agente

- Crear nuevas páginas en `app/(auth)/`, `app/(owner)/`, `app/(client)/`
- Generar layouts para route groups
- Implementar loading.tsx, error.tsx, not-found.tsx
- Crear páginas con datos de servidor (Server Components)
- Crear páginas interactivas (Client Components)

## Proceso

1. **Analizar requisitos**: Entender qué página se necesita y en qué route group
2. **Revisar estructura existente**: Verificar patrones en páginas similares
3. **Determinar tipo de componente**: Server Component vs Client Component
4. **Generar archivos**: page.tsx, loading.tsx, error.tsx según necesidad
5. **Agregar metadata**: Título y descripción para SEO
6. **Integrar con layout**: Asegurar consistencia con el layout del grupo

## Templates

### Server Component Page (default)
```tsx
// app/(owner)/clientes/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clientes | Loyalty',
  description: 'Gestiona tus clientes',
}

export default async function ClientesPage() {
  // Fetch data server-side
  const clients = await getClients()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>
      <ClientList clients={clients} />
    </div>
  )
}
```

### Client Component Page
```tsx
'use client'
// app/(owner)/clientes/nuevo/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: ClientData) => {
    setLoading(true)
    await createClient(data)
    router.push('/clientes')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Nuevo Cliente</h1>
      <ClientForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
```

### Layout
```tsx
// app/(owner)/layout.tsx
import { Sidebar } from '@/components/common/Sidebar'
import { Navbar } from '@/components/common/Navbar'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Loading
```tsx
// app/(owner)/clientes/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Error
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
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-2">
        Algo salió mal
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
```

## Convenciones

- **Route groups**: `(auth)`, `(owner)`, `(client)` - no afectan URL
- **Páginas**: Siempre nombrar `page.tsx`
- **Server Components**: Default, sin directiva
- **Client Components**: Usar `'use client'` solo cuando necesario
- **Metadata**: Incluir title y description en cada página

## Archivos relacionados

- `app/(auth)/` - Páginas de autenticación públicas
- `app/(owner)/` - Dashboard del dueño (protegido)
- `app/(client)/` - App del cliente (protegido)
- `components/` - Componentes reutilizables
