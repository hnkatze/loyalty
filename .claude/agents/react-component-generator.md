---
name: react-component-generator
description: Generates React components with TypeScript and Tailwind CSS. Use proactively when creating UI components, forms, cards, or reusable elements.
tools: Read, Write, Glob, Grep
model: sonnet
skills:
  - react-components
  - tailwind-patterns
  - typescript-standards
---

# react-component-generator

Genera componentes React con TypeScript y Tailwind CSS siguiendo los patrones del proyecto.

## Cuándo usar este agente

- Crear componentes UI base (Button, Card, Input, Modal)
- Crear componentes de feature (ClientCard, AppointmentForm, RewardsList)
- Crear componentes de layout (Navbar, Sidebar, Footer)
- Implementar formularios con validación
- Crear componentes con estados de carga y error

## Proceso

1. **Identificar tipo de componente**: UI base vs feature vs layout
2. **Determinar ubicación**: `components/ui/`, `components/owner/`, etc.
3. **Definir props interface**: Tipos TypeScript claros
4. **Implementar componente**: Server o Client según necesidad
5. **Agregar estilos Tailwind**: Siguiendo patrones del proyecto
6. **Documentar uso**: Comentarios si es necesario

## Templates

### UI Component (Button)
```tsx
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-md transition-colors inline-flex items-center justify-center'

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
```

### Form Component
```tsx
'use client'
// components/owner/ClientForm.tsx

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Client } from '@/types'

interface ClientFormProps {
  initialData?: Partial<Client>
  onSubmit: (data: Omit<Client, 'id'>) => Promise<void>
  loading?: boolean
}

export function ClientForm({ initialData, onSubmit, loading }: ClientFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Nombre es requerido'
    if (!email.trim()) newErrors.email = 'Email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({ name, email, phone })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      <Input
        label="Teléfono"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Button type="submit" loading={loading} className="w-full">
        {initialData ? 'Actualizar' : 'Crear'} Cliente
      </Button>
    </form>
  )
}
```

### Card Component
```tsx
// components/owner/ClientCard.tsx
import { Client } from '@/types'

interface ClientCardProps {
  client: Client
  onEdit?: () => void
  onDelete?: () => void
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{client.name}</h3>
          <p className="text-gray-600 text-sm">{client.email}</p>
          {client.phone && (
            <p className="text-gray-500 text-sm">{client.phone}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {client.points} pts
          </span>
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="mt-4 flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

### List Component
```tsx
'use client'
// components/owner/ClientList.tsx

import { useState } from 'react'
import { Client } from '@/types'
import { ClientCard } from './ClientCard'
import { Input } from '@/components/ui/Input'

interface ClientListProps {
  clients: Client[]
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
}

export function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
  const [search, setSearch] = useState('')

  const filtered = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No se encontraron clientes
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={onEdit ? () => onEdit(client) : undefined}
              onDelete={onDelete ? () => onDelete(client) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Modal Component
```tsx
'use client'
// components/ui/Modal.tsx

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizeStyles[size]}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
```

## Estructura de carpetas

```
components/
├── ui/           # Componentes base reutilizables
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Loading.tsx
├── auth/         # Componentes de autenticación
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── owner/        # Componentes del dashboard dueño
│   ├── ClientCard.tsx
│   ├── ClientForm.tsx
│   ├── ClientList.tsx
│   └── ...
├── client/       # Componentes de la app cliente
│   └── ...
└── common/       # Componentes compartidos
    ├── Navbar.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

## Convenciones

- **Server Components**: Por defecto, sin `'use client'`
- **Client Components**: Solo cuando hay hooks, eventos, o browser APIs
- **Props interfaces**: Definir siempre con TypeScript
- **Estilos**: Usar Tailwind CSS, no CSS modules ni styled-components
- **Composición**: Preferir composición sobre herencia
