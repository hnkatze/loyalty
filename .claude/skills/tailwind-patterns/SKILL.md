# Tailwind CSS Patterns

## Layout Utilities

### Flexbox
```tsx
// Horizontal center
<div className="flex justify-center">...</div>

// Vertical center
<div className="flex items-center">...</div>

// Both centered
<div className="flex items-center justify-center">...</div>

// Space between
<div className="flex justify-between items-center">...</div>

// Column layout
<div className="flex flex-col gap-4">...</div>

// Row with wrap
<div className="flex flex-wrap gap-2">...</div>
```

### Grid
```tsx
// 3 columns
<div className="grid grid-cols-3 gap-4">...</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">...</div>

// Auto-fit columns
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">...</div>
```

### Container
```tsx
// Centered container
<div className="container mx-auto px-4">...</div>

// Max width
<div className="max-w-4xl mx-auto">...</div>
```

## Spacing

### Padding
```tsx
// All sides
<div className="p-4">...</div>

// Horizontal/Vertical
<div className="px-4 py-2">...</div>

// Individual sides
<div className="pt-4 pb-2 pl-4 pr-4">...</div>
```

### Margin
```tsx
// Auto center
<div className="mx-auto">...</div>

// Negative margin
<div className="-mt-4">...</div>

// Space between children
<div className="space-y-4">...</div>
<div className="space-x-2">...</div>
```

### Gap (for flex/grid)
```tsx
<div className="flex gap-4">...</div>
<div className="grid gap-6">...</div>
```

## Typography

```tsx
// Headings
<h1 className="text-3xl font-bold">...</h1>
<h2 className="text-2xl font-semibold">...</h2>
<h3 className="text-xl font-medium">...</h3>

// Body text
<p className="text-base text-gray-700">...</p>
<p className="text-sm text-gray-500">...</p>
<span className="text-xs text-gray-400">...</span>

// Truncate
<p className="truncate">Long text...</p>
<p className="line-clamp-2">Multi-line truncate...</p>
```

## Colors

### Text
```tsx
<span className="text-gray-900">Primary text</span>
<span className="text-gray-600">Secondary text</span>
<span className="text-gray-400">Muted text</span>
<span className="text-blue-600">Link/accent</span>
<span className="text-red-500">Error</span>
<span className="text-green-500">Success</span>
```

### Background
```tsx
<div className="bg-white">...</div>
<div className="bg-gray-50">...</div>
<div className="bg-gray-100">...</div>
<div className="bg-blue-600">...</div>
<div className="bg-blue-600/50">Opacity 50%</div>
```

### Border
```tsx
<div className="border border-gray-200">...</div>
<div className="border-2 border-blue-500">...</div>
<div className="border-b border-gray-200">Bottom only</div>
```

## Common Components

### Button
```tsx
// Primary
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
  Guardar
</button>

// Secondary
<button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
  Cancelar
</button>

// Outline
<button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
  Detalles
</button>

// Danger
<button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
  Eliminar
</button>

// Disabled
<button className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed" disabled>
  Deshabilitado
</button>
```

### Input
```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Nombre..."
/>

// With error
<input
  type="text"
  className="w-full px-3 py-2 border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
/>
<p className="mt-1 text-sm text-red-500">Este campo es requerido</p>
```

### Card
```tsx
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="p-4">
    <h3 className="text-lg font-semibold">Título</h3>
    <p className="text-gray-600 mt-2">Contenido</p>
  </div>
</div>

// With hover
<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
  ...
</div>
```

### Badge
```tsx
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
  Activo
</span>
<span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
  Pendiente
</span>
<span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
  Inactivo
</span>
```

### Avatar
```tsx
// With image
<img src={avatarUrl} className="h-10 w-10 rounded-full object-cover" />

// Placeholder
<div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
  JD
</div>
```

## Responsive Design

### Breakpoints
```
sm: 640px   - Small devices
md: 768px   - Medium devices (tablets)
lg: 1024px  - Large devices (laptops)
xl: 1280px  - Extra large (desktops)
2xl: 1536px - 2X Extra large
```

### Usage
```tsx
// Mobile first approach
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Hide/show
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  ...
</div>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">...</div>
```

## Dark Mode

```tsx
// Manual dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>

// Dark mode hover
<button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
  Button
</button>
```

## Animations

```tsx
// Transition
<div className="transition-all duration-300">...</div>

// Hover effects
<div className="hover:scale-105 transition-transform">...</div>
<div className="hover:opacity-80 transition-opacity">...</div>

// Spin (loading)
<div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />

// Pulse (skeleton)
<div className="animate-pulse bg-gray-200 h-4 rounded" />

// Fade in
<div className="animate-fade-in">...</div>
```

## Common Patterns

### Form Layout
```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Nombre
    </label>
    <input className="w-full px-3 py-2 border border-gray-300 rounded-md" />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Email
    </label>
    <input className="w-full px-3 py-2 border border-gray-300 rounded-md" />
  </div>
  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">
    Enviar
  </button>
</form>
```

### List Layout
```tsx
<ul className="divide-y divide-gray-200">
  {items.map(item => (
    <li key={item.id} className="py-4 flex items-center justify-between">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-gray-500">{item.description}</p>
      </div>
      <button className="text-blue-600 hover:text-blue-700">
        Ver más
      </button>
    </li>
  ))}
</ul>
```

### Page Layout
```tsx
<div className="min-h-screen bg-gray-50">
  <header className="bg-white shadow-sm">
    <div className="container mx-auto px-4 py-4">
      <h1>Header</h1>
    </div>
  </header>

  <main className="container mx-auto px-4 py-8">
    {/* Content */}
  </main>

  <footer className="bg-gray-800 text-white">
    <div className="container mx-auto px-4 py-6">
      Footer
    </div>
  </footer>
</div>
```

### Sidebar Layout
```tsx
<div className="flex min-h-screen">
  <aside className="w-64 bg-gray-800 text-white p-4">
    Sidebar
  </aside>
  <main className="flex-1 p-8">
    Content
  </main>
</div>
```

## Utility Combinations

```tsx
// Clickable card
"bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"

// Primary button
"px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"

// Input field
"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

// Section title
"text-2xl font-bold text-gray-900 mb-4"

// Muted text
"text-sm text-gray-500"
```
