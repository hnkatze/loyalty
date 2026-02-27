# Specifications: Mobile-First UI Redesign

## SPEC-001: Client Bottom Tab Navigation

### Requirements

- The client layout MUST display a fixed bottom tab bar on screens below `md` breakpoint (768px)
- The tab bar MUST contain exactly 5 items in this order: Inicio (`/client/dashboard`), Recompensas (`/client/recompensas`), Reservas (`/client/reservas`), Historial (`/client/historial`), Mi Perfil (`/client/perfil`)
- Each tab item MUST have a minimum tap target of 48px height
- Each tab MUST display a Lucide icon (16px) above a short label (`text-[10px]` / 10px)
- The active tab MUST show the primary color (`text-primary`) and use a filled icon variant where available
- Inactive tabs MUST use `text-muted-foreground`
- The tab bar MUST use `fixed bottom-0 inset-x-0 z-50` positioning with `bg-background/95 backdrop-blur border-t`
- The tab bar MUST be hidden on `md` and above screens (`md:hidden`)
- The client `<main>` element MUST include `pb-20` on mobile to prevent content from being hidden behind the tab bar, removed on `md` and above (`md:pb-0`)
- The existing `MobileHeader` hamburger menu MUST be removed from the client layout on mobile; the header SHOULD display only the page title and a `ThemeToggle` button
- The desktop sidebar (`ClientSidebar`) MUST remain unchanged on `md+` screens
- The tab bar component MUST be created at `src/components/layout/bottom-tab-bar.tsx`
- The tab bar MUST include safe area padding for devices with home indicators (`pb-[env(safe-area-inset-bottom)]`)

### Scenarios

#### S-001.1: Client navigates using bottom tabs on mobile
- **Given** a client user is on `/client/dashboard` on a mobile device (<768px)
- **When** they tap the "Recompensas" tab
- **Then** the app navigates to `/client/recompensas`
- **And** the "Recompensas" tab displays in `text-primary` with a filled Gift icon
- **And** the "Inicio" tab returns to `text-muted-foreground` with an outline icon

#### S-001.2: Tab bar is hidden on desktop
- **Given** a client user is on any client page on a desktop device (>=768px)
- **When** the page renders
- **Then** the bottom tab bar is not visible
- **And** the desktop sidebar is visible with all 5 navigation items

#### S-001.3: Content is not obscured by tab bar
- **Given** a client user is on `/client/historial` on a mobile device
- **When** they scroll to the bottom of the page content
- **Then** all content is visible above the tab bar with no overlap
- **And** the bottom padding (`pb-20`) provides clearance for the fixed tab bar

#### S-001.4: Tab bar respects safe areas
- **Given** a client user opens the app on an iPhone with a home indicator
- **When** the bottom tab bar renders
- **Then** the tab bar extends its padding to account for `safe-area-inset-bottom`
- **And** tab items remain fully visible and tappable above the home indicator

---

## SPEC-002: Owner Mobile Navigation Improvement

### Requirements

- The owner layout MUST keep the existing sidebar on `md+` desktop screens unchanged
- The mobile hamburger menu (`MobileHeader`) MUST be replaced with a full-height slide-over panel using `Sheet` (side `left`)
- The slide-over panel MUST group the 10 owner nav items into 3 sections:
  - **Operaciones**: Dashboard, Escanear QR, Canjes
  - **Gestión**: Clientes, Servicios, Empleados, Agenda, Recompensas
  - **Administración**: Reportes, Configuración
- Each section MUST have a section header (`text-xs font-semibold text-muted-foreground uppercase tracking-wider`)
- Each nav item in the slide-over MUST have a minimum height of 44px (`min-h-[44px]`)
- The mobile header MUST display a contextual page title (derived from the current route) instead of the generic "Loyalty" text
- The mobile header MUST include a back button (ChevronLeft icon) when the user is on a sub-page (not Dashboard)
- A floating action button (FAB) MUST be displayed on mobile for contextual quick actions
- The FAB MUST be positioned at `fixed bottom-6 right-4 z-40` with `size-14 rounded-full shadow-lg`
- The FAB MUST use the primary color (`bg-primary text-primary-foreground`)
- The FAB action MUST be contextual per page:
  - `/owner/clientes`: "Add client" (UserPlus icon)
  - `/owner/agenda`: "New appointment" (CalendarPlus icon)
  - `/owner/servicios`: "Add service" (Plus icon)
  - `/owner/empleados`: "Add employee" (UserPlus icon)
  - `/owner/recompensas`: "Add reward" (Plus icon)
  - Other pages: FAB SHOULD be hidden
- The FAB MUST have `active:scale-95 transition-transform duration-100` press feedback
- The FAB component MUST be created at `src/components/layout/fab.tsx`

### Scenarios

#### S-002.1: Owner opens grouped mobile navigation
- **Given** an owner user is on `/owner/clientes` on a mobile device
- **When** they tap the hamburger menu icon in the header
- **Then** a full-height slide-over panel opens from the left
- **And** nav items are grouped under "Operaciones", "Gestión", and "Administración" section headers
- **And** the "Clientes" item shows active state (`bg-primary text-primary-foreground`)

#### S-002.2: Mobile header shows contextual page title
- **Given** an owner user navigates to `/owner/servicios` on mobile
- **When** the page renders
- **Then** the mobile header displays "Servicios" as the page title instead of "Loyalty"
- **And** a back button (ChevronLeft) is visible to the left of the title

#### S-002.3: FAB appears with contextual action
- **Given** an owner user is on `/owner/clientes` on a mobile device
- **When** the page renders
- **Then** a round FAB with a UserPlus icon appears at the bottom-right of the screen
- **When** the owner taps the FAB
- **Then** the "Add client" action is triggered (opens the new client form/dialog)
- **And** the FAB shows a scale-down press animation (`active:scale-95`)

#### S-002.4: FAB is hidden on pages without contextual action
- **Given** an owner user is on `/owner/dashboard` on a mobile device
- **When** the page renders
- **Then** no FAB is displayed

#### S-002.5: FAB is hidden on desktop
- **Given** an owner user is on `/owner/clientes` on a desktop device (>=768px)
- **When** the page renders
- **Then** the FAB is not visible

---

## SPEC-003: Card System Redesign

### Requirements

- The base `Card` component (`src/components/ui/card.tsx`) MUST change `rounded-xl` to `rounded-2xl`
- The base `Card` MUST replace `border shadow-sm` with `ring-1 ring-border/50 shadow-md`
- The `Card` MUST add `shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]` as the layered shadow (light mode)
- Tappable cards (cards wrapped in links or with onClick handlers) MUST include `active:scale-[0.98] transition-all duration-150 cursor-pointer` classes
- Tappable cards SHOULD include `active:bg-muted/50` for a subtle press background shift
- Card internal padding MUST be `p-4 md:p-6` (adjusted from current `px-6 py-6`)
- `CardHeader` padding MUST be `px-4 md:px-6`
- `CardContent` padding MUST be `px-4 md:px-6`
- `CardFooter` padding MUST be `px-4 md:px-6`
- Gap between cards in grid/flex layouts MUST be `gap-3 md:gap-4`
- A new `StatCard` component MUST be created at `src/components/ui/stat-card.tsx`
- `StatCard` MUST support a subtle gradient background via a `gradient` prop (e.g., `from-primary/5 to-transparent`)
- `StatCard` MUST accept `title` (string), `value` (string | number), `description` (string, optional), `icon` (LucideIcon, optional), and `trend` (up | down | neutral, optional) props
- `StatCard` MUST use `rounded-2xl` and the same layered shadow as base Card

### Scenarios

#### S-003.1: Cards render with updated visual style
- **Given** a page with Card components renders
- **When** the user views the page
- **Then** all cards display `rounded-2xl` corners (radius ~18px)
- **And** cards have a soft ring border (`ring-1 ring-border/50`) instead of a solid border
- **And** cards have a layered shadow providing depth hierarchy

#### S-003.2: Tappable card provides touch feedback
- **Given** a client user is viewing a list of rewards on mobile
- **When** they press and hold on a reward card (that is a link)
- **Then** the card scales down to 98% (`scale-[0.98]`)
- **And** the card background shifts to `bg-muted/50`
- **When** they release the press
- **Then** the card returns to its original size with a 150ms transition

#### S-003.3: StatCard displays KPI data with gradient
- **Given** the owner dashboard renders
- **When** the stat cards for total clients, points, and revenue load
- **Then** each StatCard shows a subtle gradient background from `primary/5` to transparent
- **And** each displays a title, value, optional trend indicator, and icon

#### S-003.4: Card padding adjusts per breakpoint
- **Given** a Card component renders on a mobile device (<768px)
- **When** the user views the card
- **Then** the card has `p-4` (16px) padding
- **Given** the same Card component renders on desktop (>=768px)
- **Then** the card has `p-6` (24px) padding

---

## SPEC-004: Color Palette Refinement

### Requirements

#### Light Mode

- The `--primary` color MUST shift from `oklch(0.55 0.2 250)` to `oklch(0.55 0.19 262)` (blue-indigo, hue 262)
- The `--background` MUST shift from `oklch(0.99 0.005 250)` to `oklch(0.99 0.003 270)` (warmer near-neutral)
- The `--card` MUST shift from `oklch(1 0.003 250)` to `oklch(1 0.002 270)` (warmer white)
- The `--popover` MUST match the new `--card` value
- The `--foreground` MUST remain at `oklch(0.15 0.02 250)` or shift to `oklch(0.13 0.015 262)` for slightly warmer dark text
- The `--secondary` MUST shift to `oklch(0.96 0.012 262)`
- The `--muted` MUST shift to `oklch(0.96 0.008 270)`
- The `--muted-foreground` MUST remain at minimum 4.5:1 contrast ratio against `--background` (WCAG AA)
- The `--accent` MUST shift to `oklch(0.94 0.035 262)`
- The `--border` MUST shift to `oklch(0.92 0.015 270)` (warmer border)
- The `--ring` MUST match the new `--primary` value
- A new `--success` custom property MUST be added with value `oklch(0.65 0.17 175)` (teal-green accent)
- A new `--success-foreground` custom property MUST be added with value `oklch(0.985 0 0)` (white)

#### Dark Mode

- The `--primary` MUST shift to `oklch(0.68 0.16 262)` (brighter blue-indigo for dark backgrounds)
- The `--background` MUST shift to `oklch(0.14 0.018 262)` (richer dark with blue-purple undertone)
- The `--card` MUST shift to `oklch(0.18 0.022 262)`
- The `--popover` MUST match the new dark `--card` value
- The `--secondary` MUST shift to `oklch(0.25 0.028 262)`
- The `--muted` MUST shift to `oklch(0.25 0.022 270)`
- The `--muted-foreground` MUST maintain minimum 4.5:1 contrast ratio against `--card` background
- The `--border` MUST shift to `oklch(0.30 0.035 262)`
- A new `--success` custom property MUST be added with value `oklch(0.70 0.15 175)` (teal-green for dark mode)
- A new `--success-foreground` MUST be added with value `oklch(0.12 0.02 175)`

#### Theme Integration

- The `@theme inline` block in `globals.css` MUST register `--color-success: var(--success)` and `--color-success-foreground: var(--success-foreground)`
- All sidebar-related color variables MUST be updated to use hue 262 to match the new primary
- All chart color variables SHOULD be updated to harmonize with the new hue 262 base
- All OKLCH values MUST be validated for WCAG AA contrast (4.5:1 for normal text, 3:1 for large text) before implementation
- The color changes MUST be isolated to `src/app/globals.css` with no structural code changes required

### Scenarios

#### S-004.1: Light mode renders with warmer palette
- **Given** the app is in light mode
- **When** a page renders
- **Then** the page background appears as a warm near-white (not blue-tinted)
- **And** the primary buttons and active navigation use a blue-indigo tone (hue 262)
- **And** cards appear slightly elevated with a warmer white than the page background

#### S-004.2: Dark mode renders with rich undertones
- **Given** the app is in dark mode
- **When** a page renders
- **Then** the page background appears as a rich dark with subtle blue-purple undertone
- **And** the primary color is brighter and more legible against the dark background
- **And** card surfaces are visually distinguishable from the page background

#### S-004.3: Success color is used for positive actions
- **Given** a client earns points or redeems a reward
- **When** the success toast or indicator renders
- **Then** it uses the teal-green `--success` color instead of the default primary blue
- **And** the text on the success indicator meets WCAG AA contrast requirements

#### S-004.4: Text contrast meets WCAG AA under outdoor conditions
- **Given** the app is in light mode
- **When** all text elements are rendered
- **Then** `--foreground` on `--background` achieves at minimum 4.5:1 contrast ratio
- **And** `--muted-foreground` on `--background` achieves at minimum 4.5:1 contrast ratio
- **And** `--primary-foreground` on `--primary` achieves at minimum 4.5:1 contrast ratio
- **And** `--card-foreground` on `--card` achieves at minimum 4.5:1 contrast ratio

---

## SPEC-005: Typography and Touch Targets

### Requirements

#### Touch Targets

- All interactive elements (buttons, links, tappable list items, nav items) MUST have a minimum tap area of 44x44px on mobile
- Bottom tab bar items MUST have a minimum tap area of 48px height (see SPEC-001)
- All buttons MUST have a minimum height of `h-10` (40px) on mobile; the default button size SHOULD be updated from `h-9` to `h-10`
- The `lg` button variant MUST have `h-12` (48px) height
- Form inputs (`Input`, `Select`, `Textarea`) MUST use `h-12` (48px) height on mobile (`h-12 md:h-10`)
- The minimum gap between adjacent interactive elements (buttons, links) MUST be `gap-3` (12px) to prevent mis-taps
- Icon buttons MUST have minimum `size-10` (40px) on mobile; the default `icon` size variant SHOULD update from `size-9` to `size-10`

#### Typography Scale

- Page titles MUST use `text-xl font-bold md:text-2xl` consistently across all pages
- Section headers MUST use `text-lg font-semibold`
- Body text MUST use `text-sm` (14px) as the base size
- Caption and meta text MUST use `text-xs text-muted-foreground`
- Key page headings MAY use fluid type via `clamp()`: `text-[clamp(1.25rem,4vw,1.5rem)]` for the primary heading
- Label text for form fields MUST use `text-sm font-medium`

#### Spacing Rhythm

- Page-level padding MUST be `p-4 md:p-6` (already established, MUST be enforced consistently)
- Section gaps within a page MUST use `space-y-6`
- Card internal content gap MUST use `gap-4`
- Form field spacing MUST use `space-y-4`

### Scenarios

#### S-005.1: Button tap targets meet minimum on mobile
- **Given** a mobile user views any page with buttons
- **When** a default-size button renders
- **Then** the button has at least 40px height (`h-10`)
- **And** the touch area is at least 44x44px (accounting for any padding/margin)

#### S-005.2: Input fields are comfortable to tap on mobile
- **Given** a user is filling a form on a mobile device
- **When** input fields render
- **Then** each input has `h-12` (48px) height on mobile
- **And** each input has comfortable padding for thumb typing
- **Given** the same form renders on desktop (>=768px)
- **Then** each input has `h-10` (40px) height

#### S-005.3: Page titles are consistent across all pages
- **Given** a user navigates to any page in the app
- **When** the page renders
- **Then** the main page heading uses `text-xl font-bold` on mobile and `text-2xl font-bold` on desktop
- **And** section sub-headings use `text-lg font-semibold`

#### S-005.4: Adjacent buttons have sufficient spacing
- **Given** a form has "Cancel" and "Save" buttons side by side
- **When** rendered on mobile
- **Then** the gap between them is at least 12px (`gap-3`)
- **And** each button has at least 40px height

#### S-005.5: Typography scale is consistent
- **Given** any page in the app renders
- **When** text content is displayed
- **Then** body text uses 14px (`text-sm`)
- **And** meta/caption text uses 12px (`text-xs`) with muted-foreground color
- **And** no page uses heading sizes outside the defined scale

---

## SPEC-006: Loading States and Transitions

### Requirements

#### Skeleton Loaders

- A `Skeleton` component MUST be available at `src/components/ui/skeleton.tsx` (install via shadcn if not present)
- The spinner emoji loading state in `src/app/client/layout.tsx` MUST be replaced with a layout skeleton showing: a bottom tab bar placeholder, a header bar placeholder, and 3 content block placeholders
- The spinner emoji loading state in `src/app/owner/layout.tsx` MUST be replaced with a layout skeleton showing: a sidebar placeholder (desktop), a header placeholder (mobile), and content area with 3 block placeholders
- Each client route MUST have a `loading.tsx` file with a content-aware skeleton:
  - `/client/dashboard/loading.tsx`: 4 stat card skeletons + 2 list item skeletons
  - `/client/recompensas/loading.tsx`: 3 reward card skeletons in a grid
  - `/client/reservas/loading.tsx`: Calendar skeleton + 2 appointment skeletons
  - `/client/historial/loading.tsx`: 6 list item skeletons
  - `/client/perfil/loading.tsx`: Avatar circle skeleton + 4 field skeletons
- Each owner route MUST have a `loading.tsx` file with appropriate skeleton patterns
- Skeleton elements MUST use `animate-pulse bg-muted rounded-md` styling
- Skeleton blocks MUST approximate the size and layout of the real content they replace

#### Page Transitions

- All page content containers MUST include a fade-in animation: `animate-in fade-in-0 duration-300`
- The fade-in animation MUST use CSS-only transforms (`opacity`) for GPU acceleration
- Cards on dashboard pages MAY stagger their entrance using `animation-delay` on children: 0ms, 50ms, 100ms, 150ms per card
- The `disableTransitionOnChange` prop on `ThemeProvider` MUST remain to avoid theme-switch flicker

#### Micro-interactions

- All buttons MUST include `active:scale-95 transition-transform duration-100` for press feedback
- The button base styles in `src/components/ui/button.tsx` MUST be updated to include these active states
- Toggle/switch components SHOULD retain their existing shadcn animations
- Success states (reward earned, points added) SHOULD show a brief scale-up pulse: `animate-bounce` for 300ms or a custom `scale-100 -> scale-105 -> scale-100` keyframe over 200ms

#### Toast Position

- The `Toaster` component in `src/app/layout.tsx` MUST change `position` from `"top-right"` to `"top-center"` for mobile
- The Toaster SHOULD use a responsive approach: `top-center` is acceptable for all breakpoints given the mobile-first priority
- Toast notifications MUST remain `richColors` enabled

### Scenarios

#### S-006.1: Layout skeleton replaces spinner on client load
- **Given** the client layout is loading (user authenticated, fetching role data)
- **When** the loading state is active
- **Then** a layout skeleton is displayed with placeholder shapes for the tab bar, header, and content area
- **And** no spinner emoji is visible
- **And** the skeleton elements pulse with `animate-pulse`

#### S-006.2: Route-level skeleton shows content-aware placeholder
- **Given** a client user navigates to `/client/dashboard`
- **When** the page data is loading (Suspense boundary active)
- **Then** a `loading.tsx` skeleton renders showing 4 stat card placeholders and 2 list item placeholders
- **And** the skeleton layout matches the actual dashboard structure

#### S-006.3: Page content fades in on navigation
- **Given** a user navigates from `/client/dashboard` to `/client/recompensas`
- **When** the new page content renders
- **Then** the content fades in over 300ms (`animate-in fade-in-0 duration-300`)
- **And** the transition uses GPU-accelerated opacity animation

#### S-006.4: Button press provides haptic-style feedback
- **Given** a user views any page with buttons on a mobile device
- **When** they press a button
- **Then** the button scales to 95% (`active:scale-95`) with a 100ms transition
- **When** they release the button
- **Then** the button returns to 100% scale

#### S-006.5: Toast appears at top-center on mobile
- **Given** a user performs an action that triggers a toast notification
- **When** the toast renders on a mobile device
- **Then** the toast appears at the top-center of the viewport
- **And** the toast is fully visible and does not overlap the mobile header

#### S-006.6: Owner layout skeleton renders on load
- **Given** the owner layout is loading
- **When** the loading state is active on a mobile device
- **Then** a layout skeleton shows a header placeholder and 3 content block placeholders
- **Given** the loading state is active on a desktop device
- **Then** a layout skeleton shows a sidebar placeholder (w-64) and content area with 3 block placeholders

---

## SPEC-007: Bottom Sheets for Mobile Dialogs

### Requirements

- A `ResponsiveDialog` component MUST be created (or the existing `Dialog` pattern MUST be wrapped) to render as a `Drawer` (bottom sheet) on mobile (<768px) and as a `Dialog` on desktop (>=768px)
- The shadcn `Drawer` component (based on Vaul) MUST be installed if not already present
- The `ResponsiveDialog` MUST accept the same props as `Dialog` (`open`, `onOpenChange`, `children`) and internally switch rendering based on viewport width
- The viewport detection MUST use a `useMediaQuery("(min-width: 768px)")` hook (create at `src/hooks/use-media-query.ts` if not present)
- The bottom sheet MUST include a drag handle indicator at the top (4px height, 48px width, `rounded-full bg-muted-foreground/30`)
- The bottom sheet MUST support swipe-to-dismiss gesture (provided by Vaul)
- The bottom sheet MUST have `rounded-t-2xl` top corners
- The bottom sheet MUST not exceed 90% of viewport height (`max-h-[90vh]`)
- The following pages MUST migrate their `Dialog` usage to `ResponsiveDialog`:
  - Owner: Confirm redemption dialogs, add client, add service, add employee forms
  - Client: Redeem reward confirmation
- Desktop dialog behavior MUST remain unchanged (centered modal with overlay)

### Scenarios

#### S-007.1: Dialog renders as bottom sheet on mobile
- **Given** an owner user is on `/owner/clientes` on a mobile device
- **When** they tap "Add client" (via FAB or button)
- **Then** a bottom sheet slides up from the bottom of the screen
- **And** the sheet has rounded top corners (`rounded-t-2xl`)
- **And** a drag handle indicator is visible at the top
- **And** the sheet does not exceed 90% of the viewport height

#### S-007.2: Dialog renders as centered modal on desktop
- **Given** an owner user is on `/owner/clientes` on a desktop device
- **When** they click "Add client"
- **Then** a centered dialog modal appears with an overlay
- **And** the dialog has `rounded-lg` corners (standard Dialog behavior)

#### S-007.3: Bottom sheet supports swipe-to-dismiss
- **Given** a bottom sheet is open on mobile
- **When** the user swipes the sheet downward past the dismiss threshold
- **Then** the sheet closes with a slide-down animation
- **And** the `onOpenChange` callback fires with `false`

#### S-007.4: Bottom sheet is scrollable for long content
- **Given** a bottom sheet is open with a long form (e.g., add service with many fields)
- **When** the content exceeds the visible area
- **Then** the sheet content is scrollable within the `max-h-[90vh]` constraint
- **And** the drag handle area remains fixed at the top

---

## SPEC-008: Sticky Headers with Scroll Enhancement

### Requirements

- The mobile header (`MobileHeader`) MUST maintain `sticky top-0 z-50 backdrop-blur` positioning
- The header border-bottom MUST fade in on scroll: initially `border-transparent`, transitioning to `border-border` when the user scrolls past 10px
- The border transition MUST use `transition-colors duration-200`
- Scroll detection MUST use a lightweight `useEffect` with `scroll` event listener and `requestAnimationFrame` throttling
- The mobile header for the client layout MUST display the current page title derived from the route (e.g., "Inicio", "Recompensas", "Reservas")
- The header height MUST be `h-14` (56px) on mobile -- unchanged from current

### Scenarios

#### S-008.1: Header border fades in on scroll
- **Given** a user is at the top of any page on mobile
- **When** the page has not been scrolled
- **Then** the header has no visible bottom border (`border-transparent`)
- **When** the user scrolls down past 10px
- **Then** the header bottom border transitions to visible (`border-border`) over 200ms

#### S-008.2: Header shows page title on mobile
- **Given** a client user is on `/client/reservas` on mobile
- **When** the header renders
- **Then** the header displays "Reservas" as the page title
- **And** the title is centered or left-aligned within the header

---

## SPEC-009: Empty States

### Requirements

- A reusable `EmptyState` component MUST be created at `src/components/ui/empty-state.tsx`
- The component MUST accept: `icon` (LucideIcon), `title` (string), `description` (string), and `action` (optional ReactNode for a CTA button)
- The component MUST center its content vertically and horizontally within its container
- The icon MUST render at `size-12` (48px) with `text-muted-foreground/50` color
- The title MUST use `text-lg font-semibold text-foreground`
- The description MUST use `text-sm text-muted-foreground max-w-sm text-center`
- The action button (if provided) MUST render below the description with `mt-4` spacing
- The following list views MUST use `EmptyState` when data is empty:
  - `/client/historial`: icon `History`, title "Sin historial", description "Aún no tienes transacciones registradas."
  - `/client/recompensas`: icon `Gift`, title "Sin recompensas", description "Aún no hay recompensas disponibles."
  - `/client/reservas`: icon `Calendar`, title "Sin reservas", description "No tienes citas programadas.", action "Reservar cita"
  - `/owner/clientes`: icon `Users`, title "Sin clientes", description "Aún no tienes clientes registrados.", action "Agregar cliente"
  - `/owner/empleados`: icon `UserCog`, title "Sin empleados", description "Aún no has agregado empleados.", action "Agregar empleado"
  - `/owner/servicios`: icon `Scissors`, title "Sin servicios", description "Aún no has creado servicios.", action "Crear servicio"
  - `/owner/canjes`: icon `Ticket`, title "Sin canjes", description "No hay canjes registrados."
  - `/owner/recompensas`: icon `Gift`, title "Sin recompensas", description "Aún no has creado recompensas.", action "Crear recompensa"
- Empty state containers MUST have a minimum height of `min-h-[300px]` to prevent layout collapse

### Scenarios

#### S-009.1: Empty state renders when list has no data
- **Given** an owner user navigates to `/owner/clientes`
- **When** the clients list is empty (0 records)
- **Then** an EmptyState component renders with the Users icon, "Sin clientes" title, and description
- **And** an "Agregar cliente" button is displayed below the description

#### S-009.2: Empty state action button triggers expected flow
- **Given** the empty state is displayed on `/owner/clientes`
- **When** the owner taps "Agregar cliente"
- **Then** the add client form opens (same behavior as the FAB or header add button)

#### S-009.3: Empty state is replaced when data loads
- **Given** the empty state was displayed on `/owner/clientes`
- **When** the owner adds a client and data refreshes
- **Then** the empty state is replaced with the client list
- **And** the empty state is no longer visible

#### S-009.4: Empty state maintains minimum height
- **Given** a list page has no data
- **When** the empty state renders
- **Then** the empty state container has at least 300px height
- **And** the content (icon, title, description) is centered within that space

---

## Cross-Cutting Requirements

### Performance

- All animations MUST use GPU-accelerated CSS properties only (`transform`, `opacity`)
- No JavaScript-driven animation libraries SHALL be introduced
- The bottom tab bar and FAB MUST NOT cause layout shift on mount
- Skeleton loaders MUST render within the same frame as the loading state (no flash of empty content)

### Accessibility

- All new interactive elements MUST be keyboard navigable
- The bottom tab bar MUST use `<nav>` with `role="tablist"` and individual tabs with `role="tab"` and `aria-selected`
- The FAB MUST have an `aria-label` describing its action (e.g., "Agregar cliente")
- Bottom sheets MUST trap focus when open and return focus on close
- All color combinations MUST pass WCAG AA (4.5:1 normal text, 3:1 large text / UI components)
- Empty state icons MUST NOT be the only indicator -- text labels are always required

### Responsive Breakpoints

- The `md` breakpoint (768px) MUST be the primary dividing line between mobile and desktop patterns
- Mobile-specific components (bottom tab bar, FAB, bottom sheets) MUST be hidden at `md+`
- Desktop-specific components (sidebar) MUST be hidden below `md`

### Browser Support

- All CSS features used MUST be supported in Safari 16+, Chrome 110+, Firefox 110+
- `oklch()` color values are supported in all target browsers
- `env(safe-area-inset-bottom)` MUST be used with a fallback: `pb-4` as default, `pb-[env(safe-area-inset-bottom)]` as enhancement
- `backdrop-filter: blur()` MUST use the `supports-[backdrop-filter]` variant for graceful degradation
