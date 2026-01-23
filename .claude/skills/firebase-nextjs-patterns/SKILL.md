# Firebase + Next.js Patterns

## Firebase Client SDK Setup

```typescript
// lib/firebase/client.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (client-side singleton)
let app: FirebaseApp
let auth: Auth
let db: Firestore

export function getFirebaseClient() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  }
  return { app, auth, db }
}

export { app, auth, db }
```

## Firebase Admin SDK Setup

```typescript
// lib/firebase/admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

// Central database (for owners registry)
let adminApp: App
let adminAuth: Auth
let adminDb: Firestore

export function getFirebaseAdmin() {
  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)
  }
  return { adminApp, adminAuth, adminDb }
}

export { adminApp, adminAuth, adminDb }
```

## Multi-Tenant Pattern

```typescript
// lib/firebase/admin.ts (continued)
import { initializeApp, getApp, deleteApp, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

interface OwnerFirebaseConfig {
  projectId: string
  clientEmail: string
  privateKey: string
}

// Cache for owner database connections
const ownerDbCache = new Map<string, Firestore>()

export async function getOwnerDatabase(ownerId: string): Promise<Firestore> {
  // Check cache first
  if (ownerDbCache.has(ownerId)) {
    return ownerDbCache.get(ownerId)!
  }

  // Get owner's Firebase config from central database
  const { adminDb } = getFirebaseAdmin()
  const ownerDoc = await adminDb.collection('owners').doc(ownerId).get()

  if (!ownerDoc.exists) {
    throw new Error('Owner not found')
  }

  const ownerConfig = ownerDoc.data()?.firebaseConfig as OwnerFirebaseConfig

  // Initialize owner's Firebase app
  const appName = `owner-${ownerId}`
  let ownerApp: App

  try {
    ownerApp = getApp(appName)
  } catch {
    ownerApp = initializeApp({
      credential: cert({
        projectId: ownerConfig.projectId,
        clientEmail: ownerConfig.clientEmail,
        privateKey: ownerConfig.privateKey.replace(/\\n/g, '\n'),
      }),
    }, appName)
  }

  const ownerDb = getFirestore(ownerApp)
  ownerDbCache.set(ownerId, ownerDb)

  return ownerDb
}

// Cleanup function (optional, for memory management)
export async function disconnectOwnerDatabase(ownerId: string) {
  const appName = `owner-${ownerId}`
  try {
    const app = getApp(appName)
    await deleteApp(app)
    ownerDbCache.delete(ownerId)
  } catch {
    // App doesn't exist, ignore
  }
}
```

## Firestore CRUD Patterns

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
  orderBy,
  Timestamp,
  Firestore,
} from 'firebase/firestore'
import { Client } from '@/types'

const COLLECTION = 'clients'

// Create
export async function createClient(
  db: Firestore,
  data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    deletedAt: null,
  })
  return docRef.id
}

// Read one
export async function getClient(db: Firestore, id: string): Promise<Client | null> {
  const docRef = doc(db, COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists() || docSnap.data().deletedAt !== null) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt.toDate().toISOString(),
    updatedAt: docSnap.data().updatedAt.toDate().toISOString(),
  } as Client
}

// Read all (with soft delete filter)
export async function getClients(db: Firestore): Promise<Client[]> {
  const q = query(
    collection(db, COLLECTION),
    where('deletedAt', '==', null),
    orderBy('createdAt', 'desc')
  )
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
    updatedAt: doc.data().updatedAt.toDate().toISOString(),
  })) as Client[]
}

// Update
export async function updateClient(
  db: Firestore,
  id: string,
  data: Partial<Omit<Client, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

// Soft delete
export async function deleteClient(db: Firestore, id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    deletedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

// Query by field
export async function getClientsByEstablishment(
  db: Firestore,
  establishmentId: string
): Promise<Client[]> {
  const q = query(
    collection(db, COLLECTION),
    where('establishmentId', '==', establishmentId),
    where('deletedAt', '==', null),
    orderBy('name', 'asc')
  )
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
    updatedAt: doc.data().updatedAt.toDate().toISOString(),
  })) as Client[]
}
```

## Real-time Subscriptions (Client-side)

```typescript
// hooks/useClientsRealtime.ts
'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Firestore } from 'firebase/firestore'
import { Client } from '@/types'

export function useClientsRealtime(db: Firestore, establishmentId: string) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'clients'),
      where('establishmentId', '==', establishmentId),
      where('deletedAt', '==', null),
      orderBy('name', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString(),
        })) as Client[]

        setClients(data)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [db, establishmentId])

  return { clients, loading, error }
}
```

## Authentication Patterns

### Client-side Auth Hook

```typescript
// hooks/useAuth.ts
'use client'

import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth'
import { getFirebaseClient } from '@/lib/firebase/client'

export function useAuth() {
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

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return { user, loading, signIn, signOut }
}
```

### Server-side Auth (API Routes)

```typescript
// lib/auth/verifyToken.ts
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { DecodedIdToken } from 'firebase-admin/auth'

export async function verifyIdToken(token: string): Promise<DecodedIdToken | null> {
  try {
    const { adminAuth } = getFirebaseAdmin()
    return await adminAuth.verifyIdToken(token)
  } catch {
    return null
  }
}

// Usage in API route
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split('Bearer ')[1]
  const decodedToken = await verifyIdToken(token)

  if (!decodedToken) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Use decodedToken.uid to identify the user
  const userId = decodedToken.uid
  // ...
}
```

### Session Cookies (for SSR)

```typescript
// lib/auth/session.ts
import { cookies } from 'next/headers'
import { getFirebaseAdmin } from '@/lib/firebase/admin'

const SESSION_COOKIE_NAME = 'session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1000 // 5 days

export async function createSessionCookie(idToken: string) {
  const { adminAuth } = getFirebaseAdmin()
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: COOKIE_MAX_AGE,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE / 1000,
    path: '/',
  })
}

export async function verifySessionCookie() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) return null

  try {
    const { adminAuth } = getFirebaseAdmin()
    return await adminAuth.verifySessionCookie(sessionCookie, true)
  } catch {
    return null
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
```

## Environment Variables

```env
# .env.local

# Firebase Client SDK (public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (private - never expose)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
```

## Firestore Indexes

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "clients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "establishmentId", "order": "ASCENDING" },
        { "fieldPath": "deletedAt", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "establishmentId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "deletedAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Owners can only access their own data
    match /clients/{clientId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.ownerId;
    }

    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

## Timestamp Helpers

```typescript
// lib/utils/timestamp.ts
import { Timestamp } from 'firebase/firestore'

export function toFirestoreTimestamp(date: Date | string): Timestamp {
  const d = typeof date === 'string' ? new Date(date) : date
  return Timestamp.fromDate(d)
}

export function fromFirestoreTimestamp(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString()
}

export function serverTimestamp() {
  return Timestamp.now()
}
```
