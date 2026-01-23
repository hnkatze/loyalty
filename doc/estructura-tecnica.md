# Estructura Técnica - Proyecto Lealtad & Agenda

## 1. ESTRUCTURA DE CARPETAS

```
proyecto-lealtad/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   ├── owner/
│   │   │   │   └── page.tsx
│   │   │   └── client/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (owner)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── clientes/
│   │   │   │   └── page.tsx
│   │   │   ├── servicios/
│   │   │   │   └── page.tsx
│   │   │   ├── empleados/
│   │   │   │   └── page.tsx
│   │   │   ├── agenda/
│   │   │   │   └── page.tsx
│   │   │   ├── recompensas/
│   │   │   │   └── page.tsx
│   │   │   ├── puntos/
│   │   │   │   ├── escanear-qr/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── historial/
│   │   │   │       └── page.tsx
│   │   │   ├── reportes/
│   │   │   │   └── page.tsx
│   │   │   └── configuracion/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (client)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── reservas/
│   │   │   ├── page.tsx
│   │   │   └── nueva-reserva/
│   │   │       └── page.tsx
│   │   ├── recompensas/
│   │   │   └── page.tsx
│   │   ├── historial/
│   │   │   └── page.tsx
│   │   ├── perfil/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register-owner/
│   │   │   │   └── route.ts
│   │   │   ├── register-client/
│   │   │   │   └── route.ts
│   │   │   └── verify-token/
│   │   │       └── route.ts
│   │   ├── owner/
│   │   │   ├── setup-firebase/
│   │   │   │   └── route.ts
│   │   │   └── get-config/
│   │   │       └── route.ts
│   │   ├── establish/
│   │   │   ├── [estId]/
│   │   │   │   ├── clients/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── employees/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── appointments/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── availability/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── rewards/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── transactions/
│   │   │   │   │   └── route.ts
│   │   │   │   └── redeem/
│   │   │   │       └── route.ts
│   │   │   └── config/
│   │   │       └── route.ts
│   │   └── health/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterOwnerForm.tsx
│   │   └── RegisterClientForm.tsx
│   ├── owner/
│   │   ├── Dashboard.tsx
│   │   ├── QRScanner.tsx
│   │   ├── ClientList.tsx
│   │   ├── ServiceCRUD.tsx
│   │   ├── EmployeeCRUD.tsx
│   │   ├── AgendaCalendar.tsx
│   │   ├── RewardsCRUD.tsx
│   │   ├── StatsCards.tsx
│   │   └── Charts.tsx
│   ├── client/
│   │   ├── Dashboard.tsx
│   │   ├── RewardsList.tsx
│   │   ├── AppointmentBooking.tsx
│   │   ├── MyAppointments.tsx
│   │   ├── TransactionHistory.tsx
│   │   └── ProfileCard.tsx
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Modal.tsx
│   │   └── ConfirmDialog.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Toast.tsx
├── lib/
│   ├── firebase/
│   │   ├── client.ts (Firebase client config)
│   │   ├── admin.ts (Firebase admin config)
│   │   ├── auth.ts
│   │   ├── firestore/
│   │   │   ├── owners.ts
│   │   │   ├── clients.ts
│   │   │   ├── services.ts
│   │   │   ├── employees.ts
│   │   │   ├── appointments.ts
│   │   │   ├── rewards.ts
│   │   │   └── transactions.ts
│   │   └── utils.ts
│   ├── auth/
│   │   ├── middleware.ts
│   │   ├── session.ts
│   │   └── protectedRoute.ts
│   ├── validators/
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── appointment.ts
│   │   └── reward.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── qr.ts
│   │   ├── availability.ts
│   │   └── formatting.ts
│   └── constants.ts
├── types/
│   ├── index.ts
│   ├── user.ts
│   ├── client.ts
│   ├── service.ts
│   ├── employee.ts
│   ├── appointment.ts
│   ├── reward.ts
│   └── transaction.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useFirebase.ts
│   ├── useEstablishment.ts
│   └── useClients.ts
├── context/
│   ├── AuthContext.tsx
│   └── FirebaseContext.tsx
├── styles/
│   └── globals.css
├── public/
│   ├── icons/
│   └── images/
├── .env.local.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 2. TIPOS DE DATOS (TypeScript)

```typescript
// types/index.ts

// Owner (Dueño)
export interface Owner {
  id: string
  email: string
  name: string
  createdAt: Date
  firebaseConfig: {
    projectId: string
    apiKey: string
    authDomain: string
    databaseURL: string
  }
  subscription: {
    plan: 'free' | 'pro' | 'premium'
    status: 'active' | 'inactive'
  }
}

// Client (Cliente)
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  balance: number // Puntos
  avatar?: string
  establishmentId: string
  createdAt: Date
  lastVisit?: Date
}

// Service (Servicio)
export interface Service {
  id: string
  name: string
  description?: string
  duration: number // minutos
  price?: number
  isActive: boolean
  createdAt: Date
}

// Employee (Empleado)
export interface Employee {
  id: string
  name: string
  phone: string
  email?: string
  specialties: string[] // IDs de servicios
  availability: {
    [day: string]: {
      start: string // "09:00"
      end: string // "18:00"
      breakTimes?: Array<{ start: string; end: string }>
    }
  }
  createdAt: Date
}

// Appointment (Cita/Reserva)
export interface Appointment {
  id: string
  clientId: string
  serviceId: string
  employeeId: string
  date: Date // Fecha y hora
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Reward (Recompensa)
export interface Reward {
  id: string
  name: string
  description?: string
  cost: number // Puntos necesarios
  image?: string
  isActive: boolean
  redemptionCount: number
  createdAt: Date
}

// Transaction (Transacción de Puntos)
export interface Transaction {
  id: string
  clientId: string
  type: 'earned' | 'redeemed'
  amount: number
  rewardId?: string
  appointmentId?: string
  notes?: string
  createdAt: Date
}

// Establishment (Establecimiento)
export interface Establishment {
  id: string
  name: string
  phone: string
  address: string
  hours: {
    [day: string]: {
      open: string // "09:00"
      close: string // "18:00"
      closed?: boolean
    }
  }
  logo?: string
  description?: string
  currencyName: string // "Puntos"
  currencySymbol: string // "⭐"
  createdAt: Date
}
```

---

## 3. CONFIGURACIÓN DE FIREBASE

### BD Central (Firebase Project)

```typescript
// lib/firebase/client.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuración del proyecto central
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### BD de Dueños (Firebase Admin SDK)

```typescript
// lib/firebase/admin.ts
import admin from 'firebase-admin'

export const initializeAdminApp = (serviceAccountPath: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountPath)),
    })
  }
  return admin
}

// Conectar a Firebase de un dueño específico
export const getOwnerFirebaseApp = (ownerConfig: Owner['firebaseConfig']) => {
  const app = admin.initializeApp(
    {
      // Usar credenciales del dueño
      projectId: ownerConfig.projectId,
    },
    ownerConfig.projectId // nombre único para cada app
  )
  return app
}
```

### Reglas de Firestore (Ejemplo para BD Central)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Owners
    match /owners/{ownerId} {
      allow read, write: if request.auth.uid == ownerId;
    }
  }
}
```

### Reglas de Firestore (Ejemplo para BD de Dueño)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Clientes: pueden leer su propio perfil
    match /clients/{clientId} {
      allow read: if request.auth.uid == clientId;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == clientId && 
                       !request.resource.data.keys().hasAny(['balance', 'established']);
    }
    
    // Servicios: públicos para lectura
    match /services/{serviceId} {
      allow read: if request.auth != null;
      allow write: if isOwner(); // verificar que es dueño
    }
    
    // Empleados: públicos para lectura
    match /employees/{employeeId} {
      allow read: if request.auth != null;
      allow write: if isOwner();
    }
    
    // Citas: cliente ve sus propias citas
    match /appointments/{appointmentId} {
      allow read: if request.auth.uid == resource.data.clientId || isOwner();
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.clientId || isOwner();
    }
    
    // Recompensas: públicas para lectura
    match /rewards/{rewardId} {
      allow read: if request.auth != null;
      allow write: if isOwner();
    }
    
    // Transacciones
    match /transactions/{transactionId} {
      allow read: if request.auth.uid == resource.data.clientId || isOwner();
      allow write: if isOwner();
    }
    
    function isOwner() {
      // Verificar en custom claims si es dueño (implementar en backend)
      return request.auth.token.role == 'owner';
    }
  }
}
```

---

## 4. EJEMPLO DE SERVICIO (Firestore Cliente)

```typescript
// lib/firebase/firestore/clients.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Firestore,
} from 'firebase/firestore'
import { Client } from '@/types'

const COLLECTION = 'clients'

export const createClient = async (
  db: Firestore,
  clientData: Omit<Client, 'id'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...clientData,
    createdAt: new Date(),
  })
  return docRef.id
}

export const getClient = async (
  db: Firestore,
  clientId: string
): Promise<Client | null> => {
  const docRef = doc(db, COLLECTION, clientId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Client
}

export const updateClientBalance = async (
  db: Firestore,
  clientId: string,
  newBalance: number
): Promise<void> => {
  const docRef = doc(db, COLLECTION, clientId)
  await updateDoc(docRef, { balance: newBalance })
}

export const getClientsByEstablishment = async (
  db: Firestore,
  establishmentId: string
): Promise<Client[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('establishmentId', '==', establishmentId)
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Client[]
}

export const deleteClient = async (
  db: Firestore,
  clientId: string
): Promise<void> => {
  const docRef = doc(db, COLLECTION, clientId)
  await deleteDoc(docRef)
}
```

---

## 5. EJEMPLO DE API ROUTE

```typescript
// app/api/establish/[estId]/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/firebase/serverApp'
import { createClient, getClientsByEstablishment } from '@/lib/firebase/firestore/clients'
import { validateClientData } from '@/lib/validators/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { estId: string } }
) {
  try {
    const authToken = request.headers.get('authorization')?.split(' ')[1]

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar token del dueño
    // const decodedToken = await admin.auth().verifyIdToken(authToken)

    const body = await request.json()
    const { name, email, phone, establishmentId } = body

    // Validar datos
    const validation = validateClientData({ name, email, phone })
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors },
        { status: 400 }
      )
    }

    // Obtener Firestore del dueño
    const db = getDB(params.estId) // Aquí obtenemos la BD del dueño

    // Crear cliente
    const clientId = await createClient(db, {
      name,
      email,
      phone,
      balance: 0,
      establishmentId: params.estId,
      createdAt: new Date(),
    } as any)

    return NextResponse.json({
      success: true,
      clientId,
    })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { estId: string } }
) {
  try {
    const db = getDB(params.estId)
    const clients = await getClientsByEstablishment(db, params.estId)

    return NextResponse.json({
      success: true,
      clients,
    })
  } catch (error) {
    console.error('Error getting clients:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

---

## 6. VARIABLES DE ENTORNO

```env
# .env.local

# BD Central (Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Firebase Admin (servidor)
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. DEPENDENCIAS (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "firebase": "^10.5.0",
    "firebase-admin": "^12.0.0",
    "qrcode.react": "^1.0.1",
    "html5-qrcode": "^2.3.4",
    "tailwindcss": "^3.3.0",
    "recharts": "^2.10.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/node": "^20.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## 8. PRÓXIMOS PASOS

1. Inicializar proyecto Next.js con TypeScript
2. Configurar Tailwind CSS
3. Crear estructura base de carpetas
4. Setup de Firebase (BD central + Admin SDK)
5. Implementar auth con Google OAuth
6. Crear primeros componentes y páginas
