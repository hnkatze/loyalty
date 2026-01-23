# React 19 Component Patterns

## Component Types

### Server Component (Default)
```tsx
// components/owner/ClientStats.tsx
// No 'use client' = Server Component

import { getClientCount } from '@/lib/firebase/firestore/clients'

export async function ClientStats() {
  const count = await getClientCount()

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Total Clientes</h3>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  )
}
```

### Client Component
```tsx
'use client'
// components/owner/ClientForm.tsx

import { useState } from 'react'

interface ClientFormProps {
  onSubmit: (data: ClientData) => void
  initialData?: ClientData
}

export function ClientForm({ onSubmit, initialData }: ClientFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, email, phone })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Teléfono</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full px-3 py-2 border rounded-md"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Guardar
      </button>
    </form>
  )
}
```

## Props Patterns

### Basic Props
```tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-md transition-colors'

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}
```

### Extending HTML Elements
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
```

## Composition Pattern

```tsx
// Card component with composable parts
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-b bg-gray-50">{children}</div>
}

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>
}

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-t bg-gray-50">{children}</div>
}

// Usage
<Card>
  <Card.Header>
    <h3>Cliente</h3>
  </Card.Header>
  <Card.Body>
    <p>Información del cliente</p>
  </Card.Body>
  <Card.Footer>
    <Button>Editar</Button>
  </Card.Footer>
</Card>
```

## Children Pattern

```tsx
// Modal component
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
```

## Render Props Pattern

```tsx
interface DataListProps<T> {
  data: T[]
  loading?: boolean
  error?: string
  renderItem: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
}

export function DataList<T>({
  data,
  loading,
  error,
  renderItem,
  emptyMessage = 'No hay datos'
}: DataListProps<T>) {
  if (loading) {
    return <div className="animate-pulse">Cargando...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (data.length === 0) {
    return <div className="text-gray-500">{emptyMessage}</div>
  }

  return <div className="space-y-2">{data.map(renderItem)}</div>
}

// Usage
<DataList
  data={clients}
  loading={isLoading}
  renderItem={(client, i) => <ClientCard key={client.id} client={client} />}
  emptyMessage="No hay clientes registrados"
/>
```

## Conditional Rendering

```tsx
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }

  const labels = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
```

## Event Handling

```tsx
'use client'

interface ConfirmButtonProps {
  onConfirm: () => void
  children: React.ReactNode
}

export function ConfirmButton({ onConfirm, children }: ConfirmButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    if (showConfirm) {
      onConfirm()
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-md ${
        showConfirm
          ? 'bg-red-600 text-white'
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      {showConfirm ? '¿Confirmar?' : children}
    </button>
  )
}
```

## Loading States

```tsx
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ size = 'md' }: LoadingProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeStyles[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
      />
    </div>
  )
}
```

## File Naming Convention

| Type | File Name | Example |
|------|-----------|---------|
| UI Component | PascalCase.tsx | `Button.tsx`, `Card.tsx` |
| Feature Component | PascalCase.tsx | `ClientForm.tsx`, `AppointmentCard.tsx` |
| Index export | index.ts | Re-export multiple components |
| Types alongside | types.ts | Component-specific types |
