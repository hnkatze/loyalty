# Next.js API Routes Patterns

## Basic Route Handler

```typescript
// app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clients = await getClients()
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = await createClient(body)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating client' },
      { status: 500 }
    )
  }
}
```

## Dynamic Route Parameters

```typescript
// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const client = await getClient(id)

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching client' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const body = await request.json()
    await updateClient(id, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating client' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    await deleteClient(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting client' },
      { status: 500 }
    )
  }
}
```

## Query Parameters

```typescript
// app/api/clients/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status')

  try {
    const { clients, total } = await getClients({
      page,
      limit,
      search,
      status,
    })

    return NextResponse.json({
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching clients' },
      { status: 500 }
    )
  }
}
```

## Request Validation with Zod

```typescript
// lib/validators/client.ts
import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  establishmentId: z.string().uuid('ID de establecimiento inválido'),
})

export const updateClientSchema = createClientSchema.partial()

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
```

```typescript
// app/api/clients/route.ts
import { createClientSchema } from '@/lib/validators/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = createClientSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const id = await createClient(result.data)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating client' },
      { status: 500 }
    )
  }
}
```

## Authentication Middleware Pattern

```typescript
// lib/auth/apiAuth.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from './verifyToken'

export type AuthenticatedRequest = NextRequest & {
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
      { error: 'Missing authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.split('Bearer ')[1]
  const decodedToken = await verifyIdToken(token)

  if (!decodedToken) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Attach user info to request
  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.userId = decodedToken.uid
  authenticatedRequest.userEmail = decodedToken.email

  return handler(authenticatedRequest)
}
```

```typescript
// app/api/clients/route.ts
import { withAuth, AuthenticatedRequest } from '@/lib/auth/apiAuth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const clients = await getClientsByOwner(req.userId)
    return NextResponse.json(clients)
  })
}
```

## Multi-Tenant API Pattern

```typescript
// app/api/establish/[estId]/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth/apiAuth'
import { getOwnerDatabase } from '@/lib/firebase/admin'
import { getClients, createClient } from '@/lib/firebase/firestore/clients'

type Params = { params: Promise<{ estId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const { estId } = await params

    try {
      // Get the owner's specific database
      const db = await getOwnerDatabase(estId)
      const clients = await getClients(db)
      return NextResponse.json(clients)
    } catch (error) {
      return NextResponse.json(
        { error: 'Error fetching clients' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest, { params }: Params) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const { estId } = await params

    try {
      const body = await request.json()
      const db = await getOwnerDatabase(estId)
      const id = await createClient(db, {
        ...body,
        ownerId: req.userId,
      })
      return NextResponse.json({ id }, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { error: 'Error creating client' },
        { status: 500 }
      )
    }
  })
}
```

## Error Handling Pattern

```typescript
// lib/utils/apiError.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    )
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.flatten() },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

```typescript
// app/api/clients/route.ts
import { handleApiError, ApiError } from '@/lib/utils/apiError'

export async function GET(request: NextRequest) {
  try {
    const clients = await getClients()

    if (!clients) {
      throw new ApiError(404, 'No clients found')
    }

    return NextResponse.json(clients)
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Response Helpers

```typescript
// lib/utils/apiResponse.ts
import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  )
}

export function createdResponse<T>(data: T) {
  return successResponse(data, 201)
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204 })
}
```

## CORS Headers (if needed)

```typescript
// app/api/clients/route.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json(await getClients())
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
```

## File Structure for API Routes

```
app/api/
├── auth/
│   ├── login/route.ts           # POST - Login
│   ├── register-owner/route.ts  # POST - Register owner
│   ├── register-client/route.ts # POST - Register client
│   └── logout/route.ts          # POST - Logout
├── establish/[estId]/
│   ├── clients/
│   │   ├── route.ts             # GET (list), POST (create)
│   │   └── [id]/route.ts        # GET, PUT, DELETE
│   ├── services/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── appointments/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── rewards/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── transactions/route.ts    # GET (list), POST (create points transaction)
└── health/route.ts              # GET - Health check
```

## Consistent Response Format

```typescript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": "Error message",
  "details": { ... } // Optional
}

// Paginated response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```
