# React Hooks Patterns

## Custom Hook Structure

```tsx
// hooks/useClients.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Client } from '@/types'

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  refetch: () => void
  addClient: (data: Omit<Client, 'id'>) => Promise<void>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

export function useClients(establishmentId: string): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/establish/${establishmentId}/clients`)
      if (!res.ok) throw new Error('Error al cargar clientes')
      const data = await res.json()
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [establishmentId])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const addClient = async (data: Omit<Client, 'id'>) => {
    const res = await fetch(`/api/establish/${establishmentId}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al crear cliente')
    await fetchClients()
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

## useState Patterns

### Simple State
```tsx
const [isOpen, setIsOpen] = useState(false)
const toggle = () => setIsOpen(prev => !prev)
```

### Object State
```tsx
interface FormData {
  name: string
  email: string
  phone: string
}

const [form, setForm] = useState<FormData>({
  name: '',
  email: '',
  phone: '',
})

// Update single field
const updateField = (field: keyof FormData, value: string) => {
  setForm(prev => ({ ...prev, [field]: value }))
}

// Reset form
const resetForm = () => setForm({ name: '', email: '', phone: '' })
```

### Array State
```tsx
const [items, setItems] = useState<Item[]>([])

// Add item
const addItem = (item: Item) => setItems(prev => [...prev, item])

// Remove item
const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

// Update item
const updateItem = (id: string, updates: Partial<Item>) => {
  setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
}
```

## useEffect Patterns

### Fetch on Mount
```tsx
useEffect(() => {
  const fetchData = async () => {
    const data = await getData()
    setData(data)
  }
  fetchData()
}, []) // Empty deps = run once on mount
```

### Fetch with Dependencies
```tsx
useEffect(() => {
  if (!userId) return

  const fetchUser = async () => {
    setLoading(true)
    const user = await getUser(userId)
    setUser(user)
    setLoading(false)
  }
  fetchUser()
}, [userId]) // Re-run when userId changes
```

### Cleanup Pattern
```tsx
useEffect(() => {
  const controller = new AbortController()

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data', { signal: controller.signal })
      const data = await res.json()
      setData(data)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    }
  }
  fetchData()

  return () => controller.abort() // Cleanup on unmount
}, [])
```

### Subscription Pattern
```tsx
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setClients(clients)
  })

  return () => unsubscribe() // Cleanup subscription
}, [db])
```

## useCallback Patterns

```tsx
// Memoize callback to prevent unnecessary re-renders
const handleSubmit = useCallback(async (data: FormData) => {
  await saveData(data)
  onSuccess()
}, [onSuccess])

// With dependencies
const filteredClients = useCallback((search: string) => {
  return clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )
}, [clients])
```

## useMemo Patterns

```tsx
// Expensive computation
const sortedClients = useMemo(() => {
  return [...clients].sort((a, b) => a.name.localeCompare(b.name))
}, [clients])

// Derived state
const stats = useMemo(() => ({
  total: clients.length,
  active: clients.filter(c => c.status === 'active').length,
  totalPoints: clients.reduce((sum, c) => sum + c.points, 0),
}), [clients])
```

## useRef Patterns

```tsx
// DOM reference
const inputRef = useRef<HTMLInputElement>(null)
const focusInput = () => inputRef.current?.focus()

// Mutable value (doesn't trigger re-render)
const renderCount = useRef(0)
useEffect(() => {
  renderCount.current += 1
})

// Previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
```

## Common Custom Hooks

### useToggle
```tsx
export function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle]
}

// Usage
const [isOpen, toggleOpen] = useToggle()
```

### useLocalStorage
```tsx
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    window.localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [storedValue, setValue] as const
}
```

### useDebounce
```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Usage
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

useEffect(() => {
  // Fetch with debounced value
  fetchResults(debouncedSearch)
}, [debouncedSearch])
```

### useMediaQuery
```tsx
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

// Usage
const isMobile = useMediaQuery('(max-width: 768px)')
```

### useForm
```tsx
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const handleChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleBlur = (field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  const setFieldError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    reset,
    setFieldError,
    setValues,
  }
}
```

## Hook Rules

1. **Only call at top level** - Never inside loops, conditions, or nested functions
2. **Only call from React functions** - Components or custom hooks
3. **Name custom hooks with `use` prefix** - `useClients`, `useAuth`
4. **Keep hooks focused** - One responsibility per hook
5. **Return consistent shape** - Always return same structure
