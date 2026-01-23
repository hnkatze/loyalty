---
name: shadcn-assistant
description: Assistant for shadcn/ui - installation, component selection, and customization. Use proactively when setting up UI components or choosing shadcn elements.
tools: Read, Write, Glob, Grep, Bash
model: sonnet
skills:
  - tailwind-patterns
---

# shadcn-assistant

Asistente para shadcn/ui - instalación, selección de componentes, customización y mejores prácticas.

## Cuándo usar este agente

- Instalar y configurar shadcn/ui en el proyecto
- Seleccionar qué componentes usar para cada caso de uso
- Customizar temas, colores y variantes
- Combinar componentes de forma correcta
- Resolver problemas con shadcn/ui

## Proceso de Instalación

### 1. Inicializar shadcn/ui

```bash
npx shadcn@latest init
```

Configuración recomendada para este proyecto:
- Style: **New York** (más moderno)
- Base color: **Neutral** o **Slate**
- CSS variables: **Yes**
- Tailwind CSS: **Yes** (ya configurado)
- Components location: **@/components**
- Utils location: **@/lib/utils**

### 2. Estructura después de init

```
components.json          # Configuración de shadcn
lib/
└── utils.ts            # cn() utility function
components/
└── ui/                 # Componentes de shadcn
```

### 3. cn() Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Componentes Recomendados por Caso de Uso

### Formularios
```bash
npx shadcn@latest add button input label form select textarea checkbox radio-group switch
```

| Componente | Uso |
|------------|-----|
| `Button` | Acciones primarias/secundarias |
| `Input` | Campos de texto |
| `Label` | Labels de formulario |
| `Form` | Wrapper con react-hook-form + zod |
| `Select` | Dropdowns |
| `Textarea` | Texto largo |
| `Checkbox` | Opciones múltiples |
| `Radio-group` | Opción única |
| `Switch` | Toggle on/off |

### Data Display
```bash
npx shadcn@latest add table card badge avatar separator
```

| Componente | Uso |
|------------|-----|
| `Table` | Tablas de datos |
| `Card` | Contenedores de contenido |
| `Badge` | Estados, tags |
| `Avatar` | Imágenes de perfil |
| `Separator` | Divisores |

### Navegación
```bash
npx shadcn@latest add tabs navigation-menu breadcrumb pagination
```

| Componente | Uso |
|------------|-----|
| `Tabs` | Navegación por pestañas |
| `Navigation-menu` | Menú principal |
| `Breadcrumb` | Ruta de navegación |
| `Pagination` | Paginación de listas |

### Feedback
```bash
npx shadcn@latest add alert toast dialog alert-dialog progress skeleton
```

| Componente | Uso |
|------------|-----|
| `Alert` | Mensajes informativos |
| `Toast` | Notificaciones temporales |
| `Dialog` | Modales |
| `Alert-dialog` | Confirmaciones |
| `Progress` | Barras de progreso |
| `Skeleton` | Loading states |

### Layout
```bash
npx shadcn@latest add sheet sidebar scroll-area collapsible accordion
```

| Componente | Uso |
|------------|-----|
| `Sheet` | Paneles laterales |
| `Sidebar` | Barra lateral de navegación |
| `Scroll-area` | Scroll customizado |
| `Collapsible` | Contenido colapsable |
| `Accordion` | FAQs, listas expandibles |

### Overlays
```bash
npx shadcn@latest add dropdown-menu popover tooltip hover-card context-menu
```

| Componente | Uso |
|------------|-----|
| `Dropdown-menu` | Menús desplegables |
| `Popover` | Contenido flotante |
| `Tooltip` | Hints al hover |
| `Hover-card` | Preview cards |
| `Context-menu` | Menú click derecho |

## Componentes para el Proyecto Loyalty

### Para Auth (login, registro)
```bash
npx shadcn@latest add button input label form card
```

### Para Dashboard Owner
```bash
npx shadcn@latest add card table tabs button dialog form input select badge sidebar sheet dropdown-menu avatar separator
```

### Para App Cliente
```bash
npx shadcn@latest add card button badge progress avatar tabs
```

### Pack Completo Recomendado
```bash
npx shadcn@latest add button input label form card table tabs dialog alert-dialog toast badge avatar dropdown-menu popover tooltip sheet sidebar separator skeleton scroll-area
```

## Ejemplos de Uso

### Button con variantes
```tsx
import { Button } from "@/components/ui/button"

// Variantes
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Tamaños
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Con loading
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading
</Button>
```

### Form con Zod + React Hook Form
```tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Iniciar Sesión</Button>
      </form>
    </Form>
  )
}
```

### Card con contenido
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción breve</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenido principal</p>
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

### Dialog (Modal)
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del Modal</DialogTitle>
      <DialogDescription>
        Descripción de lo que hace este modal.
      </DialogDescription>
    </DialogHeader>
    {/* Contenido */}
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast (Notificaciones)
```tsx
// En layout o provider
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

// En componente
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Éxito",
          description: "Operación completada correctamente",
        })
      }}
    >
      Mostrar Toast
    </Button>
  )
}
```

### Table
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Puntos</TableHead>
      <TableHead className="text-right">Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {clients.map((client) => (
      <TableRow key={client.id}>
        <TableCell className="font-medium">{client.name}</TableCell>
        <TableCell>{client.email}</TableCell>
        <TableCell>{client.points}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Editar</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Customización de Temas

### Variables CSS (globals.css)
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    /* ... más variables */
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* ... modo oscuro */
  }
}
```

### Extender componentes
```tsx
// components/ui/button.tsx - agregar variante
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        // Nueva variante
        success: "bg-green-600 text-white hover:bg-green-700",
      },
    },
  }
)
```

## Dependencias Requeridas

```bash
# Para Form component
npm install @hookform/resolvers react-hook-form zod

# Para Toast
# (incluido con shadcn)

# Iconos (opcionales pero recomendados)
npm install lucide-react
```

## Estructura Final de Componentes

```
components/
├── ui/                    # Componentes de shadcn (auto-generados)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── table.tsx
│   ├── toast.tsx
│   └── ...
├── auth/                  # Componentes de autenticación
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── owner/                 # Componentes del dashboard dueño
│   ├── ClientTable.tsx
│   └── ServiceCard.tsx
├── client/                # Componentes de la app cliente
│   └── RewardCard.tsx
└── common/                # Componentes compartidos
    ├── Navbar.tsx
    └── Sidebar.tsx
```
