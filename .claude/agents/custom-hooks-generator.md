---
name: custom-hooks-generator
description: Generates custom React hooks for state management, data fetching, and reusable logic. Use proactively when creating hooks for forms, modals, or data operations.
tools: Read, Write, Glob, Grep
model: sonnet
skills:
  - react-hooks-patterns
  - typescript-standards
---

# custom-hooks-generator

Genera hooks React personalizados para manejar estado, efectos y lógica reutilizable.

## Cuándo usar este agente

- Crear hooks de datos (useClients, useAppointments)
- Crear hooks de autenticación (useAuth, useSession)
- Crear hooks de UI (useModal, useToast, useDebounce)
- Crear hooks de formularios (useForm)
- Crear hooks para Firebase/Firestore
- Encapsular lógica compleja reutilizable

## Proceso

1. **Identificar necesidad**: Qué lógica se necesita encapsular
2. **Definir interface**: Return type del hook
3. **Implementar hook**: Con useState, useEffect, useCallback según necesidad
4. **Agregar tipos**: TypeScript completo
5. **Documentar**: Ejemplos de uso

## Templates

### Data Fetching Hook
```typescript
// hooks/useClients.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Client } from '@/types'

interface UseClientsOptions {
  establishmentId: string
  autoFetch?: boolean
}

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addClient: (data: Omit<Client, 'id'>) => Promise<string>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

export function useClients({
  establishmentId,
  autoFetch = true,
}: UseClientsOptions): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/establish/${establishmentId}/clients`)
      if (!res.ok) throw new Error('Error al cargar clientes')
      const data = await res.json()
      setClients(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [establishmentId])

  useEffect(() => {
    if (autoFetch) {
      fetchClients()
    }
  }, [autoFetch, fetchClients])

  const addClient = async (data: Omit<Client, 'id'>): Promise<string> => {
    const res = await fetch(`/api/establish/${establishmentId}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al crear cliente')
    const result = await res.json()
    await fetchClients()
    return result.data.id
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    const res = await fetch(`/api/establish/${establishmentId}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al actualizar cliente')
    await fetchClients()
  }

  const deleteClient = async (id: string) => {
    const res = await fetch(`/api/establish/${establishmentId}/clients/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Error al eliminar cliente')
    await fetchClients()
  }

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    addClient,
    updateClient,
    deleteClient,
  }
}
```

### Auth Hook
```typescript
// hooks/useAuth.ts
'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth'
import { getFirebaseClient } from '@/lib/firebase/client'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { auth } = getFirebaseClient()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [auth])

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [auth])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [auth])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Modal Hook
```typescript
// hooks/useModal.ts
'use client'

import { useState, useCallback } from 'react'

interface UseModalReturn<T = undefined> {
  isOpen: boolean
  data: T | undefined
  open: (data?: T) => void
  close: () => void
  toggle: () => void
}

export function useModal<T = undefined>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<T | undefined>(undefined)

  const open = useCallback((data?: T) => {
    setData(data)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setData(undefined)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return { isOpen, data, open, close, toggle }
}

// Usage:
// const clientModal = useModal<Client>()
// clientModal.open(selectedClient)
// <Modal isOpen={clientModal.isOpen} onClose={clientModal.close}>
//   <ClientForm initialData={clientModal.data} />
// </Modal>
```

### Debounce Hook
```typescript
// hooks/useDebounce.ts
'use client'

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Usage:
// const [search, setSearch] = useState('')
// const debouncedSearch = useDebounce(search, 300)
// useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
```

### Form Hook
```typescript
// hooks/useForm.ts
'use client'

import { useState, useCallback } from 'react'

interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<void> | void
}

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBlur: (field: keyof T) => () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  setFieldValue: (field: keyof T, value: T[keyof T]) => void
  reset: () => void
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((field: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
    }
  }, [])

  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouched(prev => ({ ...prev, [field]: true }))
    }
  }, [])

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (validate) {
      const validationErrors = validate(values)
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length > 0) {
        return
      }
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset,
  }
}
```

### Local Storage Hook
```typescript
// hooks/useLocalStorage.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
```

### Media Query Hook
```typescript
// hooks/useMediaQuery.ts
'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// Hooks derivados
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}
```

## Estructura de carpetas

```
hooks/
├── useAuth.ts              # Autenticación
├── useClients.ts           # CRUD de clientes
├── useAppointments.ts      # CRUD de citas
├── useRewards.ts           # CRUD de recompensas
├── useModal.ts             # Control de modales
├── useForm.ts              # Manejo de formularios
├── useDebounce.ts          # Debounce de valores
├── useLocalStorage.ts      # Persistencia local
├── useMediaQuery.ts        # Responsive queries
└── index.ts                # Re-exports
```

## Convenciones

- **Prefijo use**: Todos los hooks empiezan con `use`
- **'use client'**: Siempre incluir ya que hooks requieren client-side
- **Return type interface**: Definir interface para el return
- **useCallback**: Memoizar funciones que se pasan como props
- **Cleanup**: Siempre limpiar efectos (unsubscribe, clearTimeout)
- **Error handling**: Manejar errores gracefully
