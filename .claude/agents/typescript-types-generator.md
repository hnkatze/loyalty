---
name: typescript-types-generator
description: Generates TypeScript interfaces and types. Use proactively when defining entities, API responses, or form data types.
tools: Read, Write, Glob, Grep
model: haiku
skills:
  - typescript-standards
---

# typescript-types-generator

Genera y mantiene interfaces TypeScript consistentes para el proyecto.

## Cuándo usar este agente

- Crear interfaces para entidades (Client, Service, Appointment)
- Definir tipos de formularios (CreateClientInput, UpdateClientInput)
- Crear tipos de respuestas API
- Definir tipos utilitarios
- Mantener consistencia de tipos en el proyecto

## Proceso

1. **Analizar necesidad**: Qué entidad o datos necesitan tipado
2. **Revisar tipos existentes**: Evitar duplicación
3. **Crear interface**: Con propiedades claras y opcionales marcadas
4. **Agregar tipos derivados**: Omit, Pick, Partial según necesidad
5. **Exportar**: Desde index.ts para fácil importación

## Templates

### Entity Type
```typescript
// types/client.ts

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  points: number
  establishmentId: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

// Para crear (sin campos auto-generados)
export type CreateClientInput = Omit<Client, 'id' | 'points' | 'createdAt' | 'updatedAt' | 'deletedAt'>

// Para actualizar (todos opcionales excepto id)
export type UpdateClientInput = Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>

// Para listados (sin campos sensibles)
export type ClientSummary = Pick<Client, 'id' | 'name' | 'email' | 'points' | 'status'>
```

### User Types
```typescript
// types/user.ts

export type UserRole = 'owner' | 'client' | 'employee'

export interface BaseUser {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Owner extends BaseUser {
  role: 'owner'
  establishmentId: string
  firebaseConfig: FirebaseConfig
  subscription: SubscriptionPlan
}

export interface ClientUser extends BaseUser {
  role: 'client'
  phone?: string
  establishments: string[] // IDs de establecimientos donde está registrado
}

export interface Employee extends BaseUser {
  role: 'employee'
  establishmentId: string
  services: string[] // IDs de servicios que puede realizar
  schedule: WeeklySchedule
}

export interface FirebaseConfig {
  projectId: string
  clientEmail: string
  privateKey: string
}

export type SubscriptionPlan = 'free' | 'basic' | 'premium'
```

### Service Types
```typescript
// types/service.ts

export interface Service {
  id: string
  name: string
  description?: string
  duration: number // en minutos
  price: number
  pointsReward: number // puntos que otorga
  category: ServiceCategory
  isActive: boolean
  establishmentId: string
  createdAt: string
  updatedAt: string
}

export type ServiceCategory = 'haircut' | 'beard' | 'treatment' | 'combo' | 'other'

export type CreateServiceInput = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateServiceInput = Partial<CreateServiceInput>
```

### Appointment Types
```typescript
// types/appointment.ts

export interface Appointment {
  id: string
  clientId: string
  employeeId: string
  serviceId: string
  establishmentId: string
  date: string // ISO date string
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: AppointmentStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'

export interface AppointmentWithDetails extends Appointment {
  client: ClientSummary
  employee: EmployeeSummary
  service: ServiceSummary
}

export type CreateAppointmentInput = Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>
```

### Reward Types
```typescript
// types/reward.ts

export interface Reward {
  id: string
  name: string
  description?: string
  pointsCost: number
  type: RewardType
  value?: number // para descuentos
  isActive: boolean
  expiresAt?: string
  maxRedemptions?: number
  currentRedemptions: number
  establishmentId: string
  createdAt: string
  updatedAt: string
}

export type RewardType = 'free-service' | 'discount-percentage' | 'discount-fixed' | 'product'

export interface RewardRedemption {
  id: string
  rewardId: string
  clientId: string
  pointsSpent: number
  redeemedAt: string
  usedAt?: string
}
```

### Transaction Types
```typescript
// types/transaction.ts

export interface Transaction {
  id: string
  clientId: string
  type: TransactionType
  points: number
  balanceAfter: number
  reason: string
  referenceId?: string // appointmentId o rewardId
  referenceType?: 'appointment' | 'reward' | 'manual'
  createdAt: string
}

export type TransactionType = 'credit' | 'debit'

export interface TransactionSummary {
  totalCredits: number
  totalDebits: number
  balance: number
}
```

### API Response Types
```typescript
// types/api.ts

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: never
}

export interface ApiError {
  success: false
  error: string
  details?: Record<string, string[]>
  data?: never
}

export type ApiResult<T> = ApiResponse<T> | ApiError

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Helper type para extraer data de ApiResponse
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : never
```

### Form Types
```typescript
// types/forms.ts

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterOwnerFormData {
  email: string
  password: string
  confirmPassword: string
  displayName: string
  establishmentName: string
  phone?: string
}

export interface RegisterClientFormData {
  email: string
  password: string
  confirmPassword: string
  displayName: string
  phone?: string
}

export interface ClientFormData {
  name: string
  email: string
  phone?: string
}

export interface ServiceFormData {
  name: string
  description?: string
  duration: number
  price: number
  pointsReward: number
  category: ServiceCategory
}
```

### Utility Types
```typescript
// types/utils.ts

// Hacer todas las propiedades requeridas
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Hacer propiedades opcionales
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Excluir campos de timestamps
export type WithoutTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt' | 'deletedAt'>

// ID como string
export type WithId<T> = T & { id: string }

// Timestamps
export interface Timestamps {
  createdAt: string
  updatedAt: string
}

// Soft delete
export interface SoftDelete {
  deletedAt: string | null
}
```

### Index Export
```typescript
// types/index.ts

export * from './user'
export * from './client'
export * from './service'
export * from './appointment'
export * from './reward'
export * from './transaction'
export * from './api'
export * from './forms'
export * from './utils'
```

## Estructura de carpetas

```
types/
├── index.ts          # Re-exports
├── user.ts           # Owner, Client, Employee
├── client.ts         # Client entity
├── service.ts        # Service entity
├── appointment.ts    # Appointment entity
├── reward.ts         # Reward, Redemption
├── transaction.ts    # Points transactions
├── api.ts            # API responses
├── forms.ts          # Form data types
└── utils.ts          # Utility types
```

## Convenciones

- **Interfaces para objetos**: Usar `interface` para entidades
- **Type para uniones**: Usar `type` para uniones y aliases
- **Sufijos claros**: `Input`, `Summary`, `WithDetails`
- **Campos opcionales**: Marcar con `?` lo que puede ser undefined
- **Timestamps como string**: Usar ISO strings, no Date objects
- **Export barrel**: Re-exportar todo desde index.ts
- **Camelcase**: Para nombres de propiedades
- **PascalCase**: Para nombres de tipos/interfaces
