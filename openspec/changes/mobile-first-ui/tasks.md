# Tasks: Mobile-First UI Redesign

> **Total: 49 files across 6 phases**
> Each task is scoped to a single session. Dependencies must be completed before starting a task.

---

## Phase 1: Foundation

_No dependencies. These tasks can be done in parallel._

### 1.1 Update color palette in globals.css
- [ ] Update all OKLCH values in `:root` (light mode) to use hue 262 for primary/secondary/accent/foreground
- [ ] Update all OKLCH background values (background, card, popover, muted, border, input) to hue 270 (warmer)
- [ ] Update all OKLCH values in `.dark` to use hue 262
- [ ] Add `--success: oklch(0.65 0.17 175)` and `--success-foreground: oklch(0.985 0 0)` in `:root`
- [ ] Add `--success: oklch(0.70 0.15 175)` and `--success-foreground: oklch(0.12 0.02 175)` in `.dark`
- [ ] Register `--color-success: var(--success)` and `--color-success-foreground: var(--success-foreground)` in `@theme inline`
- [ ] Update all sidebar color variables to hue 262 (light + dark)
- [ ] Update chart color variables to harmonize with hue 262 base (light + dark)
- [ ] Validate WCAG AA contrast (4.5:1) for all foreground/background pairs
- **Files**: `src/app/globals.css`
- **Spec**: SPEC-004
- **Depends on**: None

### 1.2 Create useMediaQuery hook
- [ ] Create `src/hooks/use-media-query.ts`
- [ ] Implement `useMediaQuery(query: string): boolean` using `window.matchMedia`
- [ ] Return `false` on SSR (hydration-safe default)
- [ ] Listen for `change` events on the MediaQueryList to update state
- [ ] Clean up listener on unmount
- **Files**: `src/hooks/use-media-query.ts`
- **Spec**: SPEC-007 (ADR-002)
- **Depends on**: None

### 1.3 Create route configuration maps
- [ ] Create `src/lib/route-config.ts`
- [ ] Define `RouteConfig` interface with `title: string` and optional `fab: { icon, label, action }`
- [ ] Define `ownerRouteConfig` map with all 10 owner routes and their titles
- [ ] Add FAB config for 5 owner routes: clientes (UserPlus, "Agregar cliente", "add-client"), agenda (CalendarPlus, "Nueva cita", "add-appointment"), servicios (Plus, "Agregar servicio", "add-service"), empleados (UserPlus, "Agregar empleado", "add-employee"), recompensas (Plus, "Agregar recompensa", "add-reward")
- [ ] Define `clientRouteConfig` map with all 5 client routes and their titles
- [ ] Export `getRouteTitle(pathname, role)` helper function
- **Files**: `src/lib/route-config.ts`
- **Spec**: SPEC-002, SPEC-008 (ADR-003, ADR-004)
- **Depends on**: None

---

## Phase 2: UI Primitives

_Depends on Phase 1 completion._

### 2.1 Update Card component styles
- [ ] Change `rounded-xl` to `rounded-2xl` in Card base
- [ ] Replace `border` with `ring-1 ring-border/50`
- [ ] Replace `shadow-sm` with `shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]`
- [ ] Update Card padding from `py-6` to `p-4 md:p-6`
- [ ] Update CardHeader padding from `px-6` to `px-4 md:px-6`
- [ ] Update CardContent padding from `px-6` to `px-4 md:px-6`
- [ ] Update CardFooter padding from `px-6` to `px-4 md:px-6`
- **Files**: `src/components/ui/card.tsx`
- **Spec**: SPEC-003
- **Depends on**: 1.1

### 2.2 Update Button component for touch targets
- [ ] Add `active:scale-95 transition-transform duration-100` to base button styles
- [ ] Update default size from `h-9` to `h-10`
- [ ] Update default icon size from `size-9` to `size-10`
- [ ] Update `lg` size from `h-10` to `h-12`
- [ ] Update `lg` icon size from `size-10` to `size-12`
- **Files**: `src/components/ui/button.tsx`
- **Spec**: SPEC-005, SPEC-006
- **Depends on**: 1.1

### 2.3 Update Input component for mobile height
- [ ] Add `h-12 md:h-10` to Input component className
- [ ] Verify padding is comfortable for thumb typing on mobile
- **Files**: `src/components/ui/input.tsx`
- **Spec**: SPEC-005
- **Depends on**: 1.1

### 2.4 Install Skeleton component via shadcn
- [ ] Run `npx shadcn@latest add skeleton` to install the Skeleton primitive
- [ ] Verify `src/components/ui/skeleton.tsx` is created with `animate-pulse bg-muted rounded-md` styling
- **Files**: `src/components/ui/skeleton.tsx`
- **Spec**: SPEC-006
- **Depends on**: None (can run anytime in Phase 2)

### 2.5 Create skeleton pattern components
- [ ] Create `src/components/ui/skeleton-patterns.tsx`
- [ ] Implement `SkeletonStatCard` — matches StatCard shape (gradient placeholder + title + value)
- [ ] Implement `SkeletonListItem` — h-16 rounded-2xl horizontal bar
- [ ] Implement `SkeletonCard` — full card with header line + 3 body lines
- [ ] Implement `SkeletonAvatar` — rounded-full size-16 circle
- [ ] Implement `SkeletonCalendar` — grid of small rounded blocks approximating calendar cells
- [ ] Export all components
- **Files**: `src/components/ui/skeleton-patterns.tsx`
- **Spec**: SPEC-006 (ADR-006)
- **Depends on**: 2.4

### 2.6 Create EmptyState component
- [ ] Create `src/components/ui/empty-state.tsx`
- [ ] Accept props: `icon` (LucideIcon), `title` (string), `description` (string), `action` (optional ReactNode), `className` (optional)
- [ ] Render centered layout: `flex flex-col items-center justify-center min-h-[300px] gap-4 p-8`
- [ ] Icon: `size-12 text-muted-foreground/50` inside a `rounded-full bg-muted p-4` wrapper
- [ ] Title: `text-lg font-semibold`
- [ ] Description: `text-sm text-muted-foreground max-w-sm text-center`
- [ ] Action: render below description with `mt-4` spacing
- [ ] Keep component server-compatible (no hooks)
- **Files**: `src/components/ui/empty-state.tsx`
- **Spec**: SPEC-009
- **Depends on**: 1.1

### 2.7 Create StatCard component
- [ ] Create `src/components/ui/stat-card.tsx`
- [ ] Accept props: `title`, `value`, `description?`, `icon?` (LucideIcon), `trend?` ("up" | "down" | "neutral"), `gradient?` (string), `className?`
- [ ] Compose using Card with `rounded-2xl` and layered shadow
- [ ] Add gradient background layer via a `div` with `bg-gradient-to-br` and the `gradient` prop
- [ ] Position icon in top-right corner with `text-muted-foreground/50`
- [ ] Display value prominently (`text-2xl font-bold`)
- [ ] Show trend indicator: success color for "up", destructive for "down", muted for "neutral"
- **Files**: `src/components/ui/stat-card.tsx`
- **Spec**: SPEC-003
- **Depends on**: 2.1

### 2.8 Install Drawer component via shadcn (vaul)
- [ ] Run `npx shadcn@latest add drawer` (installs `vaul` dependency ~4KB gzipped)
- [ ] Verify `src/components/ui/drawer.tsx` is created with standard shadcn Drawer exports
- [ ] Verify `vaul` appears in `package.json` dependencies
- **Files**: `src/components/ui/drawer.tsx`, `package.json`
- **Spec**: SPEC-007
- **Depends on**: None (can run anytime in Phase 2)

### 2.9 Create ResponsiveDialog component
- [ ] Create `src/components/ui/responsive-dialog.tsx`
- [ ] Import `useMediaQuery` from `src/hooks/use-media-query.ts`
- [ ] Import Dialog components from `src/components/ui/dialog.tsx`
- [ ] Import Drawer components from `src/components/ui/drawer.tsx`
- [ ] Implement `ResponsiveDialog` that checks `useMediaQuery("(min-width: 768px)")`
- [ ] On desktop (isDesktop=true): render Radix Dialog
- [ ] On mobile (isDesktop=false): render Vaul Drawer with drag handle, `rounded-t-2xl`, `max-h-[90vh]`
- [ ] Export sub-components: `ResponsiveDialogContent`, `ResponsiveDialogHeader`, `ResponsiveDialogFooter`, `ResponsiveDialogTitle`, `ResponsiveDialogDescription`, `ResponsiveDialogClose`
- [ ] Ensure API mirrors Dialog (`open`, `onOpenChange`, `children`)
- **Files**: `src/components/ui/responsive-dialog.tsx`
- **Spec**: SPEC-007 (ADR-001)
- **Depends on**: 1.2, 2.8

---

## Phase 3: Layout Components

_Depends on Phase 1 + Phase 2 completion._

### 3.1 Create useFabAction hook
- [ ] Create `src/hooks/use-fab-action.ts`
- [ ] Implement `useFabAction(action: string, callback: () => void): void`
- [ ] Listen for `CustomEvent("fab:action")` on `window`
- [ ] Only call `callback` when `event.detail.action` matches the `action` parameter
- [ ] Clean up event listener on unmount
- **Files**: `src/hooks/use-fab-action.ts`
- **Spec**: SPEC-002 (ADR-003)
- **Depends on**: None (can start in Phase 3)

### 3.2 Create BottomTabBar component
- [ ] Create `src/components/layout/bottom-tab-bar.tsx`
- [ ] Mark as `"use client"` component
- [ ] Define 5 client tabs: Inicio (/client/dashboard, Home icon), Recompensas (/client/recompensas, Gift icon), Reservas (/client/reservas, Calendar icon), Historial (/client/historial, History icon), Mi Perfil (/client/perfil, User icon)
- [ ] Use `usePathname()` for active tab detection (`pathname === href || pathname.startsWith(href + "/")`)
- [ ] Render `<nav role="tablist">` with `<Link>` elements using `role="tab"` and `aria-selected`
- [ ] Position: `fixed bottom-0 inset-x-0 z-50`
- [ ] Style: `bg-background/95 backdrop-blur border-t`
- [ ] Each tab: icon (16px) + label (`text-[10px]`), min 48px height tap target
- [ ] Active tab: `text-primary` with filled icon variant; inactive: `text-muted-foreground`
- [ ] Add safe-area padding: `pb-[env(safe-area-inset-bottom)]` with `pb-4` fallback
- [ ] Hide on desktop: `md:hidden`
- **Files**: `src/components/layout/bottom-tab-bar.tsx`
- **Spec**: SPEC-001
- **Depends on**: 1.1

### 3.3 Create Owner FAB component
- [ ] Create `src/components/layout/fab.tsx`
- [ ] Mark as `"use client"` component
- [ ] Import `ownerRouteConfig` from `src/lib/route-config.ts`
- [ ] Use `usePathname()` to lookup FAB config for current route
- [ ] If no FAB config for current route, render nothing (return `null`)
- [ ] Render `<button>` with: `fixed bottom-6 right-4 z-40 size-14 rounded-full shadow-lg`
- [ ] Style: `bg-primary text-primary-foreground`
- [ ] Add press feedback: `active:scale-95 transition-transform duration-100`
- [ ] On click: dispatch `CustomEvent("fab:action", { detail: { action } })` on `window`
- [ ] Set `aria-label` to the FAB's label from config
- [ ] Hide on desktop: `md:hidden`
- **Files**: `src/components/layout/fab.tsx`
- **Spec**: SPEC-002
- **Depends on**: 1.3

### 3.4 Update MobileHeader component
- [ ] Import `getRouteTitle` from `src/lib/route-config.ts`
- [ ] Replace hardcoded "Loyalty" title with dynamic `getRouteTitle(pathname, role)` output
- [ ] Add scroll-aware border: use `useEffect` + `requestAnimationFrame` throttle to detect `window.scrollY > 10`
- [ ] Apply `border-transparent` at top, transition to `border-border` after scroll threshold
- [ ] Add `transition-colors duration-200` for smooth border fade
- [ ] **Owner variant**: Group nav items in Sheet into 3 sections with headers (`text-xs font-semibold text-muted-foreground uppercase tracking-wider`):
  - Operaciones: Dashboard, Escanear QR, Canjes
  - Gestion: Clientes, Servicios, Empleados, Agenda, Recompensas
  - Administracion: Reportes, Configuracion
- [ ] Each nav item in Sheet: `min-h-[44px]`
- [ ] **Owner variant**: Show ChevronLeft back button on non-dashboard pages
- [ ] **Client variant**: Remove hamburger Sheet; show only page title + ThemeToggle
- [ ] Maintain `sticky top-0 z-50 backdrop-blur` positioning and `h-14` height
- **Files**: `src/components/layout/mobile-header.tsx`
- **Spec**: SPEC-002, SPEC-008 (ADR-005)
- **Depends on**: 1.3

### 3.5 Update layout barrel exports
- [ ] Add export for `BottomTabBar` from `./bottom-tab-bar`
- [ ] Add export for `OwnerFAB` (or `FAB`) from `./fab`
- **Files**: `src/components/layout/index.ts`
- **Spec**: N/A
- **Depends on**: 3.2, 3.3

---

## Phase 4: Layout Integration

_Depends on Phase 3 completion._

### 4.1 Integrate BottomTabBar into client layout
- [ ] Import `BottomTabBar` component
- [ ] Add `<BottomTabBar />` at the bottom of the layout (inside the flex container, after main)
- [ ] Add `pb-20 md:pb-0` to `<main>` element to clear the tab bar on mobile
- [ ] Replace spinner emoji loading state with layout skeleton (tab bar placeholder, header placeholder, 3 content blocks)
- [ ] Update MobileHeader usage to client variant (no hamburger, page title only)
- [ ] Add `animate-in fade-in-0 duration-300` to main content area
- **Files**: `src/app/client/layout.tsx`
- **Spec**: SPEC-001, SPEC-006
- **Depends on**: 3.2, 3.4, 2.5

### 4.2 Integrate FAB into owner layout
- [ ] Import `OwnerFAB` component from `src/components/layout/fab.tsx`
- [ ] Add `<OwnerFAB />` at the bottom of the layout (inside the flex container, after main)
- [ ] Replace spinner emoji loading state with layout skeleton (sidebar placeholder on desktop, header placeholder on mobile, 3 content blocks)
- [ ] Update MobileHeader usage to owner variant (grouped nav, contextual title)
- [ ] Add `animate-in fade-in-0 duration-300` to main content area
- **Files**: `src/app/owner/layout.tsx`
- **Spec**: SPEC-002, SPEC-006
- **Depends on**: 3.3, 3.4, 2.5

### 4.3 Update root layout toast position
- [ ] Change Toaster `position` prop from current value to `"top-center"`
- [ ] Verify `richColors` prop remains enabled
- **Files**: `src/app/layout.tsx`
- **Spec**: SPEC-006
- **Depends on**: None (can be done anytime in Phase 4)

---

## Phase 5: Route Loading Files

_Depends on Phase 2 (skeleton patterns). Can run in parallel with Phase 3/4._

### 5.1 Create client/dashboard loading skeleton
- [ ] Create `src/app/client/dashboard/loading.tsx`
- [ ] Compose with 4 `SkeletonStatCard` in a 2x2 grid + 2 `SkeletonListItem` below
- [ ] Match actual dashboard layout structure
- **Files**: `src/app/client/dashboard/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.2 Create client/recompensas loading skeleton
- [ ] Create `src/app/client/recompensas/loading.tsx`
- [ ] Compose with 3 `SkeletonCard` in a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Files**: `src/app/client/recompensas/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.3 Create client/reservas loading skeleton
- [ ] Create `src/app/client/reservas/loading.tsx`
- [ ] Compose with `SkeletonCalendar` + 2 `SkeletonListItem` (appointment placeholders)
- **Files**: `src/app/client/reservas/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.4 Create client/historial loading skeleton
- [ ] Create `src/app/client/historial/loading.tsx`
- [ ] Compose with 6 `SkeletonListItem` stacked vertically
- **Files**: `src/app/client/historial/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.5 Create client/perfil loading skeleton
- [ ] Create `src/app/client/perfil/loading.tsx`
- [ ] Compose with `SkeletonAvatar` centered + 4 Skeleton bars (field placeholders)
- **Files**: `src/app/client/perfil/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.6 Create owner/dashboard loading skeleton
- [ ] Create `src/app/owner/dashboard/loading.tsx`
- [ ] Compose with 4 `SkeletonStatCard` in a grid + 2 `SkeletonCard` below
- **Files**: `src/app/owner/dashboard/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.7 Create owner/clientes loading skeleton
- [ ] Create `src/app/owner/clientes/loading.tsx`
- [ ] Compose as table skeleton: header bar + 6 `SkeletonListItem` rows
- **Files**: `src/app/owner/clientes/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.8 Create owner/servicios loading skeleton
- [ ] Create `src/app/owner/servicios/loading.tsx`
- [ ] Compose with grid of 4-6 `SkeletonCard` items (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Files**: `src/app/owner/servicios/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.9 Create owner/empleados loading skeleton
- [ ] Create `src/app/owner/empleados/loading.tsx`
- [ ] Compose with grid of 4-6 `SkeletonCard` items (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Files**: `src/app/owner/empleados/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.10 Create owner/agenda loading skeleton
- [ ] Create `src/app/owner/agenda/loading.tsx`
- [ ] Compose with `SkeletonCalendar` + 3 `SkeletonListItem` (appointment slots)
- **Files**: `src/app/owner/agenda/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.11 Create owner/recompensas loading skeleton
- [ ] Create `src/app/owner/recompensas/loading.tsx`
- [ ] Compose with grid of 4-6 `SkeletonCard` items (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Files**: `src/app/owner/recompensas/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.12 Create owner/puntos loading skeleton
- [ ] Create `src/app/owner/puntos/loading.tsx`
- [ ] Compose with large centered Skeleton square (scanner area) + Skeleton input bar + Skeleton button
- **Files**: `src/app/owner/puntos/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.13 Create owner/canjes loading skeleton
- [ ] Create `src/app/owner/canjes/loading.tsx`
- [ ] Compose as table skeleton: header bar + 6 `SkeletonListItem` rows
- **Files**: `src/app/owner/canjes/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.14 Create owner/reportes loading skeleton
- [ ] Create `src/app/owner/reportes/loading.tsx`
- [ ] Compose with 2 `SkeletonStatCard` + large Skeleton rectangle (chart placeholder)
- **Files**: `src/app/owner/reportes/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

### 5.15 Create owner/configuracion loading skeleton
- [ ] Create `src/app/owner/configuracion/loading.tsx`
- [ ] Compose with 6 Skeleton bars of varying widths (form field placeholders)
- **Files**: `src/app/owner/configuracion/loading.tsx`
- **Spec**: SPEC-006
- **Depends on**: 2.5

---

## Phase 6: Page Updates

_Depends on all previous phases. Each page task can be done independently._

### 6.1 Update client/dashboard page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Replace manual stat card markup with `<StatCard>` components
- [ ] Add `gradient` prop to each StatCard (e.g., `from-primary/5 to-transparent`)
- [ ] Update card grid gaps to `gap-3 md:gap-4`
- [ ] Add `animate-in fade-in-0 duration-300` to page wrapper if not inherited from layout
- **Files**: `src/app/client/dashboard/page.tsx`
- **Spec**: SPEC-003, SPEC-005, SPEC-006
- **Depends on**: 2.7, 4.1

### 6.2 Update client/recompensas page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `<EmptyState icon={Gift} title="Sin recompensas" description="Aun no hay recompensas disponibles." />` for empty list
- [ ] Update card grid gaps to `gap-3 md:gap-4`
- [ ] Add tappable card classes if reward cards are clickable: `active:scale-[0.98] transition-all duration-150 cursor-pointer`
- [ ] Migrate any Dialog usage to `<ResponsiveDialog>` (e.g., redeem reward confirmation)
- **Files**: `src/app/client/recompensas/page.tsx`
- **Spec**: SPEC-003, SPEC-005, SPEC-007, SPEC-009
- **Depends on**: 2.6, 2.9, 4.1

### 6.3 Update client/reservas page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `<EmptyState icon={Calendar} title="Sin reservas" description="No tienes citas programadas." action={<Button>Reservar cita</Button>} />` for empty list
- [ ] Update card gaps to `gap-3 md:gap-4`
- **Files**: `src/app/client/reservas/page.tsx`
- **Spec**: SPEC-005, SPEC-009
- **Depends on**: 2.6, 4.1

### 6.4 Update client/historial page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `<EmptyState icon={History} title="Sin historial" description="Aun no tienes transacciones registradas." />` for empty list
- [ ] Update list item gaps to `gap-3 md:gap-4`
- **Files**: `src/app/client/historial/page.tsx`
- **Spec**: SPEC-005, SPEC-009
- **Depends on**: 2.6, 4.1

### 6.5 Update client/perfil page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Update card gaps and section spacing to `space-y-6`
- [ ] Ensure form field spacing is `space-y-4`
- **Files**: `src/app/client/perfil/page.tsx`
- **Spec**: SPEC-005
- **Depends on**: 4.1

### 6.6 Update owner/dashboard page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Replace manual stat card markup with `<StatCard>` components
- [ ] Add `gradient` prop to each StatCard
- [ ] Update card grid gaps to `gap-3 md:gap-4`
- **Files**: `src/app/owner/dashboard/page.tsx`
- **Spec**: SPEC-003, SPEC-005
- **Depends on**: 2.7, 4.2

### 6.7 Update owner/clientes page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `<EmptyState icon={Users} title="Sin clientes" description="Aun no tienes clientes registrados." action={<Button>Agregar cliente</Button>} />` for empty list
- [ ] Add `useFabAction("add-client", openAddDialog)` hook to listen for FAB taps
- [ ] Migrate Dialog to `<ResponsiveDialog>` for add client form
- [ ] Update card/table gaps to `gap-3 md:gap-4`
- **Files**: `src/app/owner/clientes/page.tsx`
- **Spec**: SPEC-002, SPEC-005, SPEC-007, SPEC-009
- **Depends on**: 2.6, 2.9, 3.1, 4.2

### 6.8 Update owner/servicios page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `<EmptyState icon={Scissors} title="Sin servicios" description="Aun no has creado servicios." action={<Button>Crear servicio</Button>} />` for empty list
- [ ] Add `useFabAction("add-service", openAddDialog)` hook to listen for FAB taps
- [ ] Migrate Dialog to `<ResponsiveDialog>` for add service form
- [ ] Update card grid gaps to `gap-3 md:gap-4`
- **Files**: `src/app/owner/servicios/page.tsx`
- **Spec**: SPEC-002, SPEC-005, SPEC-007, SPEC-009
- **Depends on**: 2.6, 2.9, 3.1, 4.2

### 6.9 Update owner/empleados page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `<EmptyState icon={UserCog} title="Sin empleados" description="Aun no has agregado empleados." action={<Button>Agregar empleado</Button>} />` for empty list
- [ ] Add `useFabAction("add-employee", openAddDialog)` hook to listen for FAB taps
- [ ] Migrate Dialog to `<ResponsiveDialog>` for add employee form
- [ ] Update card grid gaps to `gap-3 md:gap-4`
- **Files**: `src/app/owner/empleados/page.tsx`
- **Spec**: SPEC-002, SPEC-005, SPEC-007, SPEC-009
- **Depends on**: 2.6, 2.9, 3.1, 4.2

### 6.10 Update owner/agenda page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `useFabAction("add-appointment", openAddDialog)` hook to listen for FAB taps
- [ ] Migrate any Dialog to `<ResponsiveDialog>` for new appointment form
- [ ] Update card gaps to `gap-3 md:gap-4`
- **Files**: `src/app/owner/agenda/page.tsx`
- **Spec**: SPEC-002, SPEC-005, SPEC-007
- **Depends on**: 2.9, 3.1, 4.2

### 6.11 Update owner/recompensas page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `<EmptyState icon={Gift} title="Sin recompensas" description="Aun no has creado recompensas." action={<Button>Crear recompensa</Button>} />` for empty list
- [ ] Add `useFabAction("add-reward", openAddDialog)` hook to listen for FAB taps
- [ ] Update card grid gaps to `gap-3 md:gap-4`
- **Files**: `src/app/owner/recompensas/page.tsx`
- **Spec**: SPEC-002, SPEC-005, SPEC-009
- **Depends on**: 2.6, 3.1, 4.2

### 6.12 Update owner/puntos page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Update spacing to `space-y-6` between sections
- [ ] Ensure form inputs use updated `h-12 md:h-10` sizing
- **Files**: `src/app/owner/puntos/page.tsx`
- **Spec**: SPEC-005
- **Depends on**: 4.2

### 6.13 Update owner/canjes page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Add `<EmptyState icon={Ticket} title="Sin canjes" description="No hay canjes registrados." />` for empty list
- [ ] Migrate any Dialog to `<ResponsiveDialog>` for confirm redemption
- [ ] Update table/list gaps to `gap-3 md:gap-4`
- **Files**: `src/app/owner/canjes/page.tsx`
- **Spec**: SPEC-005, SPEC-007, SPEC-009
- **Depends on**: 2.6, 2.9, 4.2

### 6.14 Update owner/reportes page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Replace manual stat cards with `<StatCard>` if applicable
- [ ] Update card gaps to `gap-3 md:gap-4`
- [ ] Update spacing to `space-y-6` between sections
- **Files**: `src/app/owner/reportes/page.tsx`
- **Spec**: SPEC-003, SPEC-005
- **Depends on**: 2.7, 4.2

### 6.15 Update owner/configuracion page
- [ ] Standardize page heading: `text-xl font-bold md:text-2xl`
- [ ] Update form field spacing to `space-y-4`
- [ ] Update section spacing to `space-y-6`
- [ ] Ensure all inputs use updated sizing
- **Files**: `src/app/owner/configuracion/page.tsx`
- **Spec**: SPEC-005
- **Depends on**: 4.2

---

## Summary

| Phase | Tasks | Files | Session Estimate |
|-------|-------|-------|-----------------|
| 1. Foundation | 3 | 3 | 1 session |
| 2. UI Primitives | 9 | 9 | 1-2 sessions |
| 3. Layout Components | 5 | 5 | 1-2 sessions |
| 4. Layout Integration | 3 | 3 | 1 session |
| 5. Route Loading | 15 | 15 | 1-2 sessions |
| 6. Page Updates | 15 | 14 | 2-3 sessions |
| **Total** | **50** | **49** | **7-11 sessions** |

## New Dependency

```bash
npx shadcn@latest add drawer
# Installs: vaul (~4KB gzipped)
# Generates: src/components/ui/drawer.tsx
```

## Dependency Graph (Simplified)

```
Phase 1 ─── globals.css
         ├── use-media-query.ts
         └── route-config.ts
              │
Phase 2 ─── card.tsx ──→ stat-card.tsx
         ├── button.tsx
         ├── input.tsx
         ├── skeleton.tsx ──→ skeleton-patterns.tsx
         ├── empty-state.tsx
         ├── drawer.tsx ──→ responsive-dialog.tsx (also needs use-media-query)
              │
Phase 3 ─── use-fab-action.ts
         ├── bottom-tab-bar.tsx
         ├── fab.tsx (needs route-config)
         ├── mobile-header.tsx (needs route-config)
         └── layout/index.ts
              │
Phase 4 ─── client/layout.tsx (needs bottom-tab-bar, skeleton-patterns)
         ├── owner/layout.tsx (needs fab, skeleton-patterns)
         └── layout.tsx (toast position)
              │
Phase 5 ─── 15 x loading.tsx (needs skeleton-patterns only)
              │
Phase 6 ─── 14 x page.tsx (needs everything above)
```
