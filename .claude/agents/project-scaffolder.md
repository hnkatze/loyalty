---
name: project-scaffolder
description: Creates complete folder structure and base files for the project. Use proactively when initializing project structure or setting up new modules.
tools: Read, Write, Bash, Glob
model: sonnet
skills:
  - nextjs-architecture
  - typescript-standards
---

# project-scaffolder

Crea la estructura completa de carpetas y archivos base del proyecto siguiendo la arquitectura definida en la documentación.

## Cuándo usar este agente

- Inicializar estructura de carpetas del proyecto
- Crear archivos base con exports vacíos
- Instalar dependencias faltantes
- Configurar el proyecto desde cero
- Aplicar estructura definida en doc/estructura-tecnica.md

## Proceso

1. **Leer documentación**: Revisar doc/estructura-tecnica.md
2. **Crear carpetas**: Estructura completa de directorios
3. **Crear archivos base**: index.ts con exports, archivos placeholder
4. **Instalar dependencias**: Las que falten según el planning
5. **Verificar**: Confirmar que todo está en su lugar

## Estructura Completa a Crear

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   ├── owner/
│   │   │   └── page.tsx
│   │   └── client/
│   │       └── page.tsx
│   └── layout.tsx
├── (owner)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── clientes/
│   │   └── page.tsx
│   ├── servicios/
│   │   └── page.tsx
│   ├── empleados/
│   │   └── page.tsx
│   ├── agenda/
│   │   └── page.tsx
│   ├── recompensas/
│   │   └── page.tsx
│   ├── puntos/
│   │   └── page.tsx
│   ├── reportes/
│   │   └── page.tsx
│   ├── configuracion/
│   │   └── page.tsx
│   └── layout.tsx
├── (client)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── reservas/
│   │   └── page.tsx
│   ├── recompensas/
│   │   └── page.tsx
│   ├── historial/
│   │   └── page.tsx
│   ├── perfil/
│   │   └── page.tsx
│   └── layout.tsx
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── register-owner/
│   │   │   └── route.ts
│   │   ├── register-client/
│   │   │   └── route.ts
│   │   └── logout/
│   │       └── route.ts
│   ├── establish/
│   │   └── [estId]/
│   │       ├── clients/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── services/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── employees/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── appointments/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── rewards/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       └── transactions/
│   │           └── route.ts
│   └── health/
│       └── route.ts
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── ui/                    # shadcn components (se agregan con npx shadcn add)
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterOwnerForm.tsx
│   ├── RegisterClientForm.tsx
│   └── index.ts
├── owner/
│   ├── Dashboard.tsx
│   ├── ClientList.tsx
│   ├── ClientForm.tsx
│   ├── ServiceList.tsx
│   ├── ServiceForm.tsx
│   ├── EmployeeList.tsx
│   ├── EmployeeForm.tsx
│   ├── AppointmentCalendar.tsx
│   ├── RewardList.tsx
│   ├── RewardForm.tsx
│   ├── QRScanner.tsx
│   ├── PointsTransaction.tsx
│   └── index.ts
├── client/
│   ├── Dashboard.tsx
│   ├── RewardsList.tsx
│   ├── AppointmentBooking.tsx
│   ├── HistoryList.tsx
│   ├── ProfileCard.tsx
│   └── index.ts
├── common/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   ├── ConfirmDialog.tsx
│   └── index.ts
└── index.ts

lib/
├── firebase/
│   ├── client.ts          # Firebase client SDK init
│   ├── admin.ts           # Firebase Admin SDK init
│   ├── auth.ts            # Auth functions
│   └── firestore/
│       ├── owners.ts
│       ├── clients.ts
│       ├── services.ts
│       ├── employees.ts
│       ├── appointments.ts
│       ├── rewards.ts
│       ├── transactions.ts
│       └── index.ts
├── auth/
│   ├── middleware.ts
│   ├── session.ts
│   ├── protectedRoute.ts
│   └── index.ts
├── validators/
│   ├── auth.ts
│   ├── client.ts
│   ├── service.ts
│   ├── employee.ts
│   ├── appointment.ts
│   ├── reward.ts
│   └── index.ts
├── utils/
│   ├── cn.ts              # Class names utility (shadcn)
│   ├── date.ts            # Date formatting
│   ├── qr.ts              # QR generation/scanning
│   ├── formatting.ts      # Data formatting
│   └── index.ts
├── constants.ts
└── index.ts

types/
├── index.ts               # Re-exports all types
├── user.ts                # Owner, Client types
├── service.ts             # Service, Employee types
├── appointment.ts         # Appointment types
├── reward.ts              # Reward, Transaction types
└── api.ts                 # API request/response types

hooks/
├── useAuth.ts
├── useFirebase.ts
├── useEstablishment.ts
├── useClients.ts
├── useAppointments.ts
├── useRewards.ts
├── useModal.ts
├── useForm.ts
├── useDebounce.ts
├── useLocalStorage.ts
├── useMediaQuery.ts
└── index.ts

context/
├── AuthContext.tsx
├── FirebaseContext.tsx
├── ThemeContext.tsx
└── index.ts
```

## Archivos Base a Crear

### types/index.ts
```typescript
export * from './user'
export * from './service'
export * from './appointment'
export * from './reward'
export * from './api'
```

### types/user.ts
```typescript
export interface Owner {
  id: string
  email: string
  businessName: string
  firebaseConfig: FirebaseConfig
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  points: number
  establishmentId: string
  createdAt: Date
  updatedAt: Date
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}
```

### types/service.ts
```typescript
export interface Service {
  id: string
  name: string
  description?: string
  duration: number // minutos
  price: number
  pointsEarned: number
  active: boolean
  establishmentId: string
  createdAt: Date
  updatedAt: Date
}

export interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'employee'
  services: string[] // IDs de servicios que puede realizar
  active: boolean
  establishmentId: string
  createdAt: Date
  updatedAt: Date
}
```

### types/appointment.ts
```typescript
export interface Appointment {
  id: string
  clientId: string
  employeeId: string
  serviceId: string
  date: Date
  startTime: string // HH:mm
  endTime: string   // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  establishmentId: string
  createdAt: Date
  updatedAt: Date
}
```

### types/reward.ts
```typescript
export interface Reward {
  id: string
  name: string
  description?: string
  pointsCost: number
  active: boolean
  establishmentId: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  clientId: string
  type: 'earn' | 'redeem'
  points: number
  description: string
  serviceId?: string    // Si es earn por servicio
  rewardId?: string     // Si es redeem por recompensa
  appointmentId?: string
  establishmentId: string
  createdAt: Date
}
```

### types/api.ts
```typescript
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### lib/utils/cn.ts
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### lib/constants.ts
```typescript
export const APP_NAME = 'Loyalty'

export const POINTS = {
  DEFAULT_EARN: 10,
  MIN_REDEEM: 100,
} as const

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  OWNER: 'owner',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
} as const
```

### hooks/index.ts
```typescript
export { useAuth } from './useAuth'
export { useFirebase } from './useFirebase'
export { useClients } from './useClients'
export { useAppointments } from './useAppointments'
export { useRewards } from './useRewards'
export { useModal } from './useModal'
export { useForm } from './useForm'
export { useDebounce } from './useDebounce'
export { useLocalStorage } from './useLocalStorage'
export { useMediaQuery, useIsMobile, useIsDesktop } from './useMediaQuery'
```

### context/index.ts
```typescript
export { AuthProvider, useAuth } from './AuthContext'
export { FirebaseProvider, useFirebase } from './FirebaseContext'
export { ThemeProvider, useTheme } from './ThemeContext'
```

### Page placeholder template
```typescript
// app/(owner)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Página en construcción</p>
    </div>
  )
}
```

### API route placeholder template
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  })
}
```

## Dependencias a Instalar

```bash
# Firebase
npm install firebase firebase-admin

# Formularios y validación
npm install react-hook-form @hookform/resolvers zod

# Utilidades
npm install clsx tailwind-merge date-fns

# Notificaciones
npm install sonner

# QR
npm install qrcode.react html5-qrcode

# Iconos
npm install lucide-react

# Tipos
npm install -D @types/qrcode.react
```

## Comando Completo de Setup

```bash
# 1. Crear estructura de carpetas
mkdir -p app/{(auth)/{login,register/{owner,client}},(owner)/{dashboard,clientes,servicios,empleados,agenda,recompensas,puntos,reportes,configuracion},(client)/{dashboard,reservas,recompensas,historial,perfil},api/{auth/{login,register-owner,register-client,logout},establish/[estId]/{clients/[id],services/[id],employees/[id],appointments/[id],rewards/[id],transactions},health}}

mkdir -p components/{ui,auth,owner,client,common}
mkdir -p lib/{firebase/firestore,auth,validators,utils}
mkdir -p types
mkdir -p hooks
mkdir -p context

# 2. Instalar dependencias
npm install firebase firebase-admin react-hook-form @hookform/resolvers zod clsx tailwind-merge date-fns sonner qrcode.react html5-qrcode lucide-react

npm install -D @types/qrcode.react

# 3. Inicializar shadcn
npx shadcn@latest init

# 4. Agregar componentes base de shadcn
npx shadcn@latest add button input label form card table tabs dialog alert-dialog toast badge avatar dropdown-menu popover tooltip sheet sidebar separator skeleton scroll-area
```

## Verificación

Después de ejecutar el scaffolding, verificar:

1. **Estructura de carpetas**: `tree` o `ls -R`
2. **package.json**: Dependencias instaladas
3. **components.json**: shadcn configurado
4. **types/**: Todos los archivos de tipos
5. **lib/**: Utilidades y configuraciones
6. **hooks/**: Custom hooks base
7. **context/**: Providers base
