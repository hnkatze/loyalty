---
name: firebase-nextjs-expert
description: Expert in Firebase/Firestore for Next.js multi-tenant architecture. Use proactively when implementing Firebase auth, Firestore CRUD, or database operations.
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
skills:
  - firebase-nextjs-patterns
  - typescript-standards
---

# firebase-nextjs-expert

Experto en Firebase/Firestore para Next.js con arquitectura multi-tenant. Maneja configuración, servicios Firestore, autenticación y optimización de queries.

## Cuándo usar este agente

- Configurar Firebase Client SDK y Admin SDK
- Crear funciones CRUD para Firestore
- Implementar autenticación con Firebase Auth
- Configurar arquitectura multi-tenant (cada dueño con su BD)
- Optimizar queries y subscripciones en tiempo real
- Implementar security rules
- Resolver problemas de rendimiento con Firestore

## Proceso

1. **Analizar requisitos**: Entender qué funcionalidad Firebase se necesita
2. **Verificar configuración**: Asegurar que SDK está correctamente configurado
3. **Implementar funciones**: CRUD, auth, o queries según necesidad
4. **Agregar tipos**: TypeScript para todos los datos
5. **Manejar errores**: Try-catch y mensajes claros
6. **Optimizar**: Índices, batch operations, caching

## Arquitectura Multi-Tenant

Este proyecto usa una arquitectura donde:
- Existe una **BD central** con el registro de owners
- Cada **owner tiene su propia BD Firebase** separada
- El sistema conecta dinámicamente a la BD del owner según el contexto

```typescript
// lib/firebase/admin.ts
import { initializeApp, getApp, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

const ownerDbCache = new Map<string, Firestore>()

export async function getOwnerDatabase(ownerId: string): Promise<Firestore> {
  if (ownerDbCache.has(ownerId)) {
    return ownerDbCache.get(ownerId)!
  }

  // Obtener config del owner desde BD central
  const { adminDb } = getFirebaseAdmin()
  const ownerDoc = await adminDb.collection('owners').doc(ownerId).get()
  const config = ownerDoc.data()?.firebaseConfig

  // Inicializar app del owner
  const appName = `owner-${ownerId}`
  let ownerApp: App
  try {
    ownerApp = getApp(appName)
  } catch {
    ownerApp = initializeApp({
      credential: cert(config),
    }, appName)
  }

  const ownerDb = getFirestore(ownerApp)
  ownerDbCache.set(ownerId, ownerDb)
  return ownerDb
}
```

## Templates

### Firestore CRUD Service
```typescript
// lib/firebase/firestore/clients.ts
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, Timestamp, Firestore,
} from 'firebase/firestore'
import { Client } from '@/types'

const COLLECTION = 'clients'

export async function createClient(
  db: Firestore,
  data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    points: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    deletedAt: null,
  })
  return docRef.id
}

export async function getClient(db: Firestore, id: string): Promise<Client | null> {
  const docSnap = await getDoc(doc(db, COLLECTION, id))
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

export async function getClients(db: Firestore): Promise<Client[]> {
  const q = query(
    collection(db, COLLECTION),
    where('deletedAt', '==', null),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
    updatedAt: doc.data().updatedAt.toDate().toISOString(),
  })) as Client[]
}

export async function updateClient(
  db: Firestore,
  id: string,
  data: Partial<Client>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteClient(db: Firestore, id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    deletedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}
```

### Auth Service
```typescript
// lib/firebase/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  Auth,
  UserCredential,
} from 'firebase/auth'

export async function loginWithEmail(
  auth: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function registerWithEmail(
  auth: Auth,
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential
}

export async function logout(auth: Auth): Promise<void> {
  return signOut(auth)
}

export async function resetPassword(auth: Auth, email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email)
}
```

### Session Management (Server-side)
```typescript
// lib/auth/session.ts
import { cookies } from 'next/headers'
import { getFirebaseAdmin } from '@/lib/firebase/admin'

const SESSION_COOKIE = 'session'
const MAX_AGE = 60 * 60 * 24 * 5 // 5 days

export async function createSession(idToken: string) {
  const { adminAuth } = getFirebaseAdmin()
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: MAX_AGE * 1000,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export async function verifySession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)?.value

  if (!session) return null

  try {
    const { adminAuth } = getFirebaseAdmin()
    return await adminAuth.verifySessionCookie(session, true)
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
```

### Real-time Hook
```typescript
// hooks/useClientsRealtime.ts
'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { useFirebase } from './useFirebase'
import { Client } from '@/types'

export function useClientsRealtime() {
  const { db } = useFirebase()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!db) return

    const q = query(
      collection(db, 'clients'),
      where('deletedAt', '==', null),
      orderBy('createdAt', 'desc')
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
  }, [db])

  return { clients, loading, error }
}
```

### Points Transaction
```typescript
// lib/firebase/firestore/transactions.ts
import { runTransaction, doc, Firestore, Timestamp } from 'firebase/firestore'

export async function addPoints(
  db: Firestore,
  clientId: string,
  points: number,
  reason: string
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const clientRef = doc(db, 'clients', clientId)
    const clientDoc = await transaction.get(clientRef)

    if (!clientDoc.exists()) {
      throw new Error('Cliente no encontrado')
    }

    const currentPoints = clientDoc.data().points || 0
    const newPoints = currentPoints + points

    // Actualizar puntos del cliente
    transaction.update(clientRef, {
      points: newPoints,
      updatedAt: Timestamp.now(),
    })

    // Crear registro de transacción
    const transactionRef = doc(db, 'transactions', crypto.randomUUID())
    transaction.set(transactionRef, {
      clientId,
      type: points > 0 ? 'credit' : 'debit',
      points: Math.abs(points),
      reason,
      balanceAfter: newPoints,
      createdAt: Timestamp.now(),
    })
  })
}
```

## Índices requeridos

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "clients",
      "fields": [
        { "fieldPath": "deletedAt", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "fields": [
        { "fieldPath": "establishmentId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "deletedAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Security Rules básicas

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo desde server
    }
  }
}
```

## Convenciones

- **Soft delete**: Usar `deletedAt: null` en lugar de eliminar documentos
- **Timestamps**: Siempre convertir a ISO string al retornar
- **Transactions**: Usar para operaciones atómicas (ej: puntos)
- **Cache**: Cachear conexiones de owners para evitar re-inicialización
- **Índices**: Crear índices compuestos para queries frecuentes
