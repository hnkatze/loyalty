---
name: api-route-generator
description: Generates Next.js API routes with validation, authentication and error handling. Use proactively when creating REST endpoints in app/api/.
tools: Read, Write, Glob, Grep
model: sonnet
skills:
  - nextjs-api-patterns
  - typescript-standards
---

# api-route-generator

Genera API Routes de Next.js con validación, autenticación y manejo de errores estandarizado.

## Cuándo usar este agente

- Crear endpoints REST (GET, POST, PUT, DELETE)
- Implementar autenticación en API routes
- Agregar validación de inputs con Zod
- Crear rutas dinámicas con parámetros
- Implementar rutas multi-tenant (por establecimiento)

## Proceso

1. **Definir endpoint**: Método, path, y propósito
2. **Crear validación**: Schema Zod para inputs
3. **Implementar handler**: Con try-catch y respuestas consistentes
4. **Agregar autenticación**: Si la ruta es protegida
5. **Documentar**: Ejemplos de request/response

## Templates

### Basic CRUD Route
```typescript
// app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getClients, createClient } from '@/lib/firebase/firestore/clients'
import { getFirebaseClient } from '@/lib/firebase/client'

const createClientSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
})

// GET /api/clients
export async function GET() {
  try {
    const { db } = getFirebaseClient()
    const clients = await getClients(db)

    return NextResponse.json({
      success: true,
      data: clients,
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar input
    const result = createClientSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { db } = getFirebaseClient()
    const id = await createClient(db, result.data)

    return NextResponse.json(
      { success: true, data: { id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}
```

### Dynamic Route with Parameters
```typescript
// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getClient, updateClient, deleteClient } from '@/lib/firebase/firestore/clients'
import { getFirebaseClient } from '@/lib/firebase/client'

type Params = { params: Promise<{ id: string }> }

const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// GET /api/clients/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const { db } = getFirebaseClient()
    const client = await getClient(db, id)

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}

// PUT /api/clients/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const body = await request.json()

    const result = updateClientSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { db } = getFirebaseClient()
    await updateClient(db, id, result.data)

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const { db } = getFirebaseClient()
    await deleteClient(db, id)

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar cliente' },
      { status: 500 }
    )
  }
}
```

### Multi-Tenant Route
```typescript
// app/api/establish/[estId]/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, AuthenticatedRequest } from '@/lib/auth/apiAuth'
import { getOwnerDatabase } from '@/lib/firebase/admin'
import { getClients, createClient } from '@/lib/firebase/firestore/clients'

type Params = { params: Promise<{ estId: string }> }

const createClientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
})

// GET /api/establish/[estId]/clients
export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const { estId } = await params

    try {
      const db = await getOwnerDatabase(estId)
      const clients = await getClients(db)

      return NextResponse.json({ success: true, data: clients })
    } catch (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { success: false, error: 'Error al obtener clientes' },
        { status: 500 }
      )
    }
  })
}

// POST /api/establish/[estId]/clients
export async function POST(request: NextRequest, { params }: Params) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const { estId } = await params

    try {
      const body = await request.json()

      const result = createClientSchema.safeParse(body)
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Error de validación',
            details: result.error.flatten().fieldErrors,
          },
          { status: 400 }
        )
      }

      const db = await getOwnerDatabase(estId)
      const id = await createClient(db, {
        ...result.data,
        establishmentId: estId,
        ownerId: req.userId,
      })

      return NextResponse.json(
        { success: true, data: { id } },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { success: false, error: 'Error al crear cliente' },
        { status: 500 }
      )
    }
  })
}
```

### Auth Routes
```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getFirebaseClient } from '@/lib/firebase/client'
import { createSession } from '@/lib/auth/session'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email, password } = result.data
    const { auth } = getFirebaseClient()

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const idToken = await userCredential.user.getIdToken()

    // Crear session cookie
    await createSession(idToken)

    return NextResponse.json({
      success: true,
      data: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)

    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
```

### Query Parameters
```typescript
// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Pagination
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  // Filters
  const status = searchParams.get('status')
  const date = searchParams.get('date')
  const employeeId = searchParams.get('employeeId')

  try {
    const { appointments, total } = await getAppointments({
      page,
      limit,
      status: status || undefined,
      date: date || undefined,
      employeeId: employeeId || undefined,
    })

    return NextResponse.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener citas' },
      { status: 500 }
    )
  }
}
```

## Auth Middleware Helper

```typescript
// lib/auth/apiAuth.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from './verifyToken'

export interface AuthenticatedRequest extends NextRequest {
  userId: string
  userEmail?: string
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Token de autorización requerido' },
      { status: 401 }
    )
  }

  const token = authHeader.split('Bearer ')[1]
  const decoded = await verifyIdToken(token)

  if (!decoded) {
    return NextResponse.json(
      { success: false, error: 'Token inválido o expirado' },
      { status: 401 }
    )
  }

  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.userId = decoded.uid
  authenticatedRequest.userEmail = decoded.email

  return handler(authenticatedRequest)
}
```

## Estructura de carpetas

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register-owner/route.ts
│   ├── register-client/route.ts
│   └── logout/route.ts
├── establish/[estId]/
│   ├── clients/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── services/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── appointments/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── rewards/
│       ├── route.ts
│       └── [id]/route.ts
└── health/route.ts
```

## Convenciones

- **Respuestas consistentes**: `{ success: boolean, data?, error?, details? }`
- **Status codes**: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error
- **Validación con Zod**: Siempre validar inputs
- **Try-catch**: Envolver toda lógica en try-catch
- **Logging**: console.error para errores
- **Auth header**: Bearer token en Authorization header
