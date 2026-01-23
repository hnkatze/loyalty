# Planning - Proyecto Lealtad & Agenda
## Sistema de Puntos y Reservas para Barberías y Salones

---

## 1. ARQUITECTURA GENERAL

### Stack Tecnológico
- **Frontend:** Next.js (App Router)
- **Auth:** Firebase Authentication (Google OAuth OBLIGATORIO)
- **Base de Datos:** Firestore (cada dueño tiene su proyecto)
- **BD Central:** Firebase (mapeo dueños → Firebase credentials)
- **Hosting:** Vercel (Next.js) + Firebase Hosting
- **Notificaciones:** No incluidas en v1

### Flujo de Proyectos
```
Tu Plataforma Central (BD mapeos)
    ↓
    ├── Dueño 1 → Firebase Project 1
    ├── Dueño 2 → Firebase Project 2
    └── Dueño N → Firebase Project N
```

---

## 2. FASES DE DESARROLLO

### FASE 1: Setup e Infraestructura (1-2 semanas)

#### 1.1 Configuración de Proyectos
- [ ] Crear estructura de carpetas Next.js
- [ ] Configurar variables de entorno por proyecto (dinámicamente)
- [ ] Setup de Firebase Admin SDK
- [ ] Crear script para generar nuevos proyectos Firebase automáticamente
- [ ] Configurar Google OAuth en Firebase

#### 1.2 Base de Datos Central (Firebase)
- [ ] Crear colección "Owners"
  - email
  - firebase_project_id
  - firebase_api_key
  - firebase_auth_domain
  - firebase_database_url
  - subscription_plan
  - created_at
  - status (active/inactive)

#### 1.3 Auth Global
- [ ] Setup de Firebase Auth en proyecto central
- [ ] Implementar Google OAuth
- [ ] Middleware para proteger rutas
- [ ] Diferenciar entre rutas de dueño y cliente

---

### FASE 2: Autenticación y Registro (2-3 semanas)

#### 2.1 Registro de Dueño
- [ ] Página de registro: Google Auth OBLIGATORIO
- [ ] Al registrarse:
  - Obtener email + nombre de Google
  - Crear proyecto Firebase automáticamente
  - Guardar credenciales en BD central
  - Redirigir a setup inicial del establecimiento

#### 2.2 Registro de Cliente
- [ ] Página de registro cliente: Google Auth OBLIGATORIO
- [ ] Obtener email + nombre de Google
- [ ] Ingresar teléfono (obligatorio)
- [ ] Seleccionar establecimiento (dropdown o código)
- [ ] Se registra en Firestore del dueño automáticamente

#### 2.3 Login Unificado
- [ ] Pantalla que diferencia: "¿Eres dueño o cliente?"
- [ ] Login con Google para ambos
- [ ] Redirigir a dashboard correspondiente

---

### FASE 3: Dashboard del Dueño (4-5 semanas)

#### 3.1 Panel Principal
- [ ] Vista general de estadísticas:
  - Clientes totales
  - Puntos distribuidos hoy
  - Recompensas canjeadas
  - Citas programadas hoy
  - Próximas citas

#### 3.2 Gestión de Servicios
- [ ] CRUD de servicios:
  - Crear: Nombre, descripción, duración, precio
  - Editar: Modificar detalles
  - Eliminar: Con confirmación
  - Listar: Mostrar todos los servicios
- [ ] Habilitar/deshabilitar servicios

#### 3.3 Gestión de Empleados
- [ ] CRUD de empleados:
  - Crear: Nombre, teléfono, email, especialidad
  - Editar: Actualizar info
  - Eliminar: Con confirmación
  - Listar: Mostrar todos
- [ ] Asignar servicios a empleados
- [ ] Horarios de empleados (días y horas disponibles)

#### 3.4 Gestión de Agenda / Reservas - Dueño
- [ ] Vista calendario:
  - Por día/semana/mes
  - Mostrar citas reservadas
  - Mostrar disponibilidad
- [ ] Ver detalles de cita:
  - Cliente, servicio, empleado, hora
  - Opción confirmar/cancelar
  - Opción reagendar
- [ ] Confirmar cita (cambiar estado a "confirmada")
- [ ] Cancelar cita (con notificación al cliente)
- [ ] Liberar horarios manuales

#### 3.5 Gestión de Clientes
- [ ] Listar clientes con:
  - Nombre, teléfono, email
  - Balance actual
  - Última visita
  - Próxima cita
  - Opción editar/eliminar
- [ ] Buscar cliente por nombre/teléfono
- [ ] Ver perfil completo del cliente
- [ ] Ver historial de citas y transacciones

#### 3.6 Sistema de Puntos (QR)
- [ ] Generar QR único por cliente (clientId)
- [ ] Escanear QR (usar librería como `jsQR` o `html5-qrcode`)
- [ ] Modal para asignar puntos:
  - Input numérico de puntos
  - Campo de nota opcional
  - Botón confirmar
- [ ] Registrar transacción en Firestore
- [ ] Feedback visual (éxito/error)

#### 3.7 Gestión de Recompensas
- [ ] CRUD de recompensas:
  - Crear: Nombre, descripción, costo en puntos
  - Editar: Cambiar nombre, costo
  - Eliminar: Con confirmación
  - Listar: Mostrar todas con estado
- [ ] Deshabilitar/habilitar recompensas
- [ ] Ver cuántas veces se canjeó cada recompensa

#### 3.8 Configuración del Establecimiento
- [ ] Nombre del negocio
- [ ] Teléfono, dirección, horarios
- [ ] Nombre de la moneda (puntos, créditos, etc)
- [ ] Símbolo de moneda
- [ ] Descripción
- [ ] Logo/Foto

#### 3.9 Reportes y Estadísticas
- [ ] Reporte de puntos distribuidos (por fecha)
- [ ] Reporte de recompensas canjeadas
- [ ] Top clientes (más puntos)
- [ ] Gráficos básicos (Chart.js o similar)

---

### FASE 4: App del Cliente (3-4 semanas)

#### 4.1 Perfil del Cliente
- [ ] Ver nombre, email, teléfono
- [ ] Editar teléfono
- [ ] Botón logout

#### 4.2 Dashboard Cliente
- [ ] Card grande con saldo de puntos
- [ ] Nombre del establecimiento
- [ ] Próxima cita reservada (si existe)
- [ ] Botón "Ver recompensas"
- [ ] Botón "Ver citas"

#### 4.3 Recompensas Disponibles
- [ ] Listar recompensas del dueño:
  - Nombre
  - Costo en puntos
  - Descripción
  - Botón "Canjear" (habilitado si tiene puntos suficientes)
- [ ] Modal de confirmación antes de canjear
- [ ] Registrar transacción (restar puntos)
- [ ] Mostrar confirmación con código de canje

#### 4.4 Sistema de Reservas - Cliente
- [ ] Listar servicios disponibles del establecimiento
- [ ] Seleccionar servicio
- [ ] Ver disponibilidad (calendario)
- [ ] Seleccionar empleado (barbero/esteticien)
- [ ] Elegir hora disponible
- [ ] Confirmar reserva
- [ ] Ver mis reservas:
  - Próxima cita
  - Fecha y hora
  - Empleado asignado
  - Opción cancelar (hasta X horas antes)
  - Historial de citas pasadas

#### 4.5 Historial de Transacciones
- [ ] Listar todas las transacciones:
  - Fecha
  - Tipo (ganado/canjeado)
  - Cantidad de puntos
  - Nota del dueño (si existe)
- [ ] Filtro por tipo
- [ ] Ordenar por fecha

#### 4.6 Perfil del Establecimiento
- [ ] Ver info del establecimiento
- [ ] Horarios
- [ ] Teléfono
- [ ] Dirección
- [ ] Logo

---

### FASE 5: Testing, Pulido y Deploy (2 semanas)

#### 5.1 Testing
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración
- [ ] Testing manual completo
- [ ] Testing en dispositivos móviles

#### 5.2 Seguridad
- [ ] Validar reglas de Firestore (read/write rules)
- [ ] Proteger rutas (middleware)
- [ ] Validar inputs en servidor
- [ ] Manejo seguro de credenciales Firebase

#### 5.3 UX/UI
- [ ] Pulir diseño (Tailwind CSS)
- [ ] Hacer responsive (mobile-first)
- [ ] Accesibilidad (WCAG)
- [ ] Dark mode (opcional)

#### 5.4 Deploy
- [ ] Vercel para Next.js
- [ ] Firebase para BD
- [ ] Dominio personalizado
- [ ] CI/CD pipeline

---

## 3. ESTRUCTURA DE DATOS

### BD Central (Firebase o PostgreSQL)
```
owners/
  {ownerId}/
    email: string
    password_hash: string (si no usas OAuth)
    firebase_project_id: string
    firebase_api_key: string
    firebase_auth_domain: string
    firebase_database_url: string
    establishment_name: string
    status: "active" | "inactive"
    plan: "free" | "pro" | "premium"
    created_at: timestamp
    updated_at: timestamp
```

### En Firebase de Cada Dueño
```
establishments/
  {establishmentId}/
    name: string
    phone: string
    address: string
    hours: object {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      ...
    }
    logo_url: string
    description: string
    currency_name: string (ej: "Puntos")
    currency_symbol: string (ej: "⭐")
    created_at: timestamp

services/
  {serviceId}/
    name: string
    description: string
    duration: number (minutos)
    price: number (opcional, para futuro)
    is_active: boolean
    created_at: timestamp

employees/
  {employeeId}/
    name: string
    phone: string
    email: string (opcional)
    specialties: array (servicios que realiza)
    availability: object {
      monday: { start: "09:00", end: "18:00", breakTime: "13:00-14:00" },
      tuesday: { ... },
      ...
    }
    created_at: timestamp

clients/
  {clientId}/
    name: string
    email: string
    phone: string
    balance: number (saldo actual de puntos)
    avatar_url: string (opcional)
    created_at: timestamp
    last_visit: timestamp (opcional)

appointments/
  {appointmentId}/
    clientId: string
    serviceId: string
    employeeId: string
    date: timestamp (fecha y hora)
    duration: number (minutos)
    status: "pending" | "confirmed" | "completed" | "cancelled"
    notes: string (opcional)
    created_at: timestamp
    updated_at: timestamp

rewards/
  {rewardId}/
    name: string
    description: string
    cost: number (puntos necesarios)
    image_url: string (opcional)
    is_active: boolean
    created_at: timestamp
    redemption_count: number

transactions/
  {transactionId}/
    clientId: string
    type: "earned" | "redeemed"
    amount: number (puntos)
    reward_id: string (solo si type es "redeemed")
    appointment_id: string (si está asociada a una cita)
    notes: string (opcional)
    created_at: timestamp
```

---

## 4. FLUJOS PRINCIPALES

### Flujo 1: Registro de Dueño
```
1. Dueño va a tu sitio
2. Clickea "Registrarse como Dueño"
3. Email + Google Auth
4. Completa info del establecimiento
5. Tú creas Firebase automáticamente
6. Se guarda en BD central
7. Recibe credenciales por email
8. Redirige a dashboard
```

### Flujo 2: Registro de Cliente
```
1. Cliente va a la app (con credenciales del dueño ya configuradas)
2. Clickea "Registrarse"
3. Email + Nombre + Teléfono + Google Auth
4. Selecciona establecimiento
5. Se crea en Firestore del dueño
6. Recibe saldo inicial (0)
7. Redirige a dashboard cliente
```

### Flujo 3: Escanear QR y Dar Puntos
```
1. Dueño en su dashboard → "Escanear QR"
2. Abre cámara
3. Escanea QR del cliente
4. Se abre modal con datos del cliente
5. Ingresa cantidad de puntos
6. Confirma
7. Se crea transacción en Firestore
8. Se actualiza balance del cliente
9. Feedback visual (exitoso)
10. Cliente ve puntos actualizados
```

### Flujo 4: Reservar Cita (Cliente)
```
1. Cliente en su dashboard → "Reservar cita"
2. Selecciona servicio
3. Elige empleado (si hay múltiples)
4. Ve calendario de disponibilidad
5. Selecciona fecha y hora disponible
6. Confirma datos
7. Se crea appointment en Firestore (status: "pending")
8. Dueño recibe la cita pendiente de confirmar
9. Cliente ve su cita como "pendiente confirmación"
```

### Flujo 5: Confirmar Cita (Dueño)
```
1. Dueño ve citas pendientes en agenda
2. Revisa detalles (cliente, servicio, hora)
3. Confirma la cita (status: "confirmed")
4. Cliente ve su cita como "confirmada"
5. O cancela la cita (con opción de notificar cliente)
```

### Flujo 6: Canjear Recompensa
```
1. Cliente ve lista de recompensas disponibles
2. Clickea en una recompensa
3. Confirma canje (si tiene puntos suficientes)
4. Se resta del balance
5. Se crea transacción de tipo "redeemed"
6. Se genera código de confirmación
7. Cliente lo muestra al dueño
8. Dueño aplica la recompensa
```

---

## 5. TAREAS TÉCNICAS ESPECÍFICAS

### Backend/API (Next.js API Routes)
- [ ] POST `/api/auth/register-owner` - Registro dueño
- [ ] POST `/api/auth/login-owner` - Login dueño (con Google)
- [ ] POST `/api/owners/{ownerId}/firebase-setup` - Crear Firebase
- [ ] POST `/api/establish/{estId}/clients` - Crear cliente
- [ ] GET `/api/establish/{estId}/clients` - Listar clientes
- [ ] GET `/api/establish/{estId}/services` - Listar servicios
- [ ] POST `/api/establish/{estId}/services` - Crear servicio
- [ ] PUT `/api/establish/{estId}/services/{serviceId}` - Editar servicio
- [ ] DELETE `/api/establish/{estId}/services/{serviceId}` - Eliminar servicio
- [ ] GET `/api/establish/{estId}/employees` - Listar empleados
- [ ] POST `/api/establish/{estId}/employees` - Crear empleado
- [ ] PUT `/api/establish/{estId}/employees/{employeeId}` - Editar empleado
- [ ] DELETE `/api/establish/{estId}/employees/{employeeId}` - Eliminar empleado
- [ ] POST `/api/establish/{estId}/appointments` - Crear cita/reserva
- [ ] GET `/api/establish/{estId}/appointments` - Listar citas
- [ ] PUT `/api/establish/{estId}/appointments/{appointmentId}` - Confirmar/cancelar cita
- [ ] GET `/api/establish/{estId}/availability` - Ver disponibilidad
- [ ] POST `/api/establish/{estId}/transactions` - Crear transacción (dar puntos)
- [ ] POST `/api/establish/{estId}/rewards` - Crear recompensa
- [ ] GET `/api/establish/{estId}/rewards` - Listar recompensas
- [ ] POST `/api/establish/{estId}/redeem` - Canjear recompensa
- [ ] GET `/api/client/{clientId}/transactions` - Historial cliente

### Frontend Components
- [ ] Componente Auth (Login/Register)
- [ ] Componente QR Scanner
- [ ] Componente Dashboard Dueño
- [ ] Componente Dashboard Cliente
- [ ] Componente Lista Clientes
- [ ] Componente CRUD Recompensas
- [ ] Componente Lista Recompensas Cliente
- [ ] Componente Historial Transacciones

### Utilidades
- [ ] Generador de QR (qrcode.react)
- [ ] Scanner QR (html5-qrcode)
- [ ] Formatos de fecha
- [ ] Validadores
- [ ] Helper Firebase

---

## 6. TIMELINE ESTIMADO

| Fase | Descripción | Duración | Inicio |
|------|-------------|----------|--------|
| 1 | Setup e Infraestructura | 1-2 sem | Semana 1 |
| 2 | Auth y Registro | 2-3 sem | Semana 2 |
| 3 | Dashboard Dueño (Puntos + Reservas) | 4-5 sem | Semana 4 |
| 4 | App Cliente (Puntos + Reservas) | 3-4 sem | Semana 9 |
| 5 | Testing y Deploy | 2 sem | Semana 12 |
| **TOTAL** | **MVP Completo** | **~16-18 semanas** | |

---

## 7. CHECKLIST DE INICIO

### Antes de Empezar
- [ ] Crear repositorio Git
- [ ] Configurar Next.js con TypeScript
- [ ] Setup Tailwind CSS
- [ ] Crear estructura de carpetas
- [ ] Configurar variables de entorno (.env.local)
- [ ] Firebase Admin SDK configurado localmente
- [ ] Script para crear proyectos Firebase

### Dependencias Principales
```json
{
  "next": "^14.0.0",
  "firebase": "^10.0.0",
  "firebase-admin": "^12.0.0",
  "next-auth": "^4.24.0",
  "qrcode.react": "^1.0.1",
  "html5-qrcode": "^2.3.4",
  "tailwindcss": "^3.3.0",
  "recharts": "^2.10.0"
}
```

---

## 8. CONSIDERACIONES IMPORTANTES

### Seguridad
- [ ] Firestore Rules: Cada usuario solo ve sus datos
- [ ] Validación en cliente Y servidor
- [ ] Proteger API routes con autenticación
- [ ] CORS configurado correctamente
- [ ] Rate limiting en API routes

### Rendimiento
- [ ] Lazy loading de componentes
- [ ] Caching de datos
- [ ] Optimizar imágenes
- [ ] Code splitting

### Escalabilidad
- [ ] Estructura agnóstica desde el inicio
- [ ] Fácil agregar nuevos establecimientos
- [ ] BD preparada para crecer

---

## 9. PRÓXIMOS PASOS

1. **Semana 1:** Confirmar este planning y empezar FASE 1
2. **Crear repositorio** y estructura base
3. **Script automático** para crear Firebase projects
4. **Primeros tests** de flujos básicos
