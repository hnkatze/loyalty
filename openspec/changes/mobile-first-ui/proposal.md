# Proposal: Mobile-First UI Redesign

## Intent

The loyalty app is primarily used from mobile devices by both business owners (on the go, at the counter) and clients (checking rewards, booking appointments). The current UI follows a desktop-first pattern with responsive breakpoints bolted on. This redesign flips the approach: design for mobile first, then enhance for desktop. The goal is an app that **feels native** on phones -- fast, tactile, polished -- while remaining fully functional on larger screens.

## Current State

| Aspect | Current | Gap |
|--------|---------|-----|
| **Navigation** | Sidebar (w-64) desktop + Sheet drawer mobile | No bottom tab bar; hamburger menu requires two taps to reach any page |
| **Cards** | Standard shadcn `rounded-xl border shadow-sm` | Flat, no depth hierarchy, no active/pressed states for touch |
| **Colors** | OKLCH blue theme (hue 250), light/dark mode | Cool-toned, low warmth; primary is saturated blue that can feel clinical |
| **Loading** | Spinner emoji (`animate-spin text-4xl: hourglass`) | No skeleton loaders, no shimmer, jarring on slow connections |
| **Spacing** | `p-4` mobile / `p-6` desktop | Adequate but not optimized for thumb zones; interactive elements lack generous tap targets |
| **Transitions** | `disableTransitionOnChange` on ThemeProvider | No page transitions, no micro-interactions, abrupt state changes |
| **Typography** | Plus Jakarta Sans 300-700, JetBrains Mono | Good choices; sizes not mobile-optimized (no fluid type scale) |
| **Mobile patterns** | Sticky header with blur (partial) | No bottom sheets, no swipe gestures, no pull-to-refresh feel |

## Proposed Changes

### 1. Navigation Overhaul

**Client role -- Bottom Tab Bar:**
- Replace the sidebar/sheet pattern with a fixed bottom tab bar (5 tabs max: Home, Rewards, Bookings, History, Profile)
- Tabs use icons + short labels, active state with filled icon and primary color indicator
- On desktop (md+), keep a slim sidebar or top nav -- the bottom bar hides

**Owner role -- Improved Mobile Navigation:**
- Keep the sidebar on desktop (it has 10 items, too many for a tab bar)
- Replace the current Sheet drawer with a full-height slide-over panel with grouped navigation sections (Operations, Management, Settings)
- Add a floating action button (FAB) on mobile for the most common action per page (e.g., "Add client", "New appointment")
- Sticky mobile header gains contextual page title and back navigation

**Files affected:** `src/components/layout/mobile-header.tsx`, `src/components/layout/client-sidebar.tsx`, `src/components/layout/owner-sidebar.tsx`, `src/app/client/layout.tsx`, `src/app/owner/layout.tsx`, new `src/components/layout/bottom-tab-bar.tsx`, new `src/components/layout/fab.tsx`

### 2. Card System Redesign

**Visual upgrade:**
- Increase border radius from `rounded-xl` to `rounded-2xl` for a softer, more modern feel
- Replace flat `border` + `shadow-sm` with layered shadows (`shadow-md` or custom multi-layer shadow) for more depth
- Add subtle background gradient on featured/stat cards (e.g., dashboard KPI cards)
- Cards get a `ring-1 ring-border/50` instead of hard border for a softer edge

**Touch interaction:**
- Add `active:scale-[0.98]` press state on tappable cards (replaces hover-only feedback)
- Transition: `transition-all duration-150` for snappy feel
- Tappable cards get a subtle background shift on press (`active:bg-muted/50`)

**Spacing:**
- Card padding increases from `px-6 py-6` to `p-5` mobile / `p-6` desktop with consistent internal rhythm
- Gap between cards: `gap-3` mobile / `gap-4` desktop

**Files affected:** `src/components/ui/card.tsx`, all page files that use Card components, potential new `src/components/ui/stat-card.tsx`

### 3. Color Palette Refinement

**Direction:** Keep the OKLCH system (it's modern and precise) but shift the palette to be warmer and more inviting.

**Specific changes:**
- **Primary:** Shift from pure blue (hue 250) to a blue-indigo (hue 260-265) with slightly higher lightness -- more vibrant, less corporate
- **Backgrounds:** Add a touch of warmth -- move from blue-tinted whites (hue 250) to a warmer neutral (hue 270 or reduce chroma to near-zero)
- **Accent/Success:** Introduce a warm accent color for positive actions (rewards earned, points gained) -- consider a teal or green-teal (hue 170-180)
- **Surface hierarchy:** Create clearer depth with 3 background levels: `background` (page), `card` (elevated), `popover` (highest)
- **Dark mode:** Richer darks with subtle blue-purple undertone instead of pure dark-blue

**Contrast:** Ensure all text meets WCAG AA (4.5:1) -- especially important for outdoor mobile use where screens wash out.

**Files affected:** `src/app/globals.css` (CSS custom properties), potentially `tailwind.config.ts` if extending theme

### 4. Typography and Touch Targets

**Touch targets:**
- All interactive elements (buttons, links, list items, nav items) must have minimum 44x44px tap area
- Nav items in bottom bar: 48px height minimum
- Form inputs: `h-12` on mobile (up from default ~`h-10`)
- Increase gap between interactive elements to prevent mis-taps (`gap-3` minimum between buttons)

**Typography scale:**
- Page titles: `text-xl font-bold` mobile / `text-2xl` desktop (currently inconsistent across pages)
- Section headers: `text-lg font-semibold`
- Body: `text-sm` (14px) -- keep current, good for mobile density
- Caption/meta: `text-xs text-muted-foreground`
- Consider fluid type using `clamp()` for key headings

**Spacing rhythm:**
- Establish a consistent spacing scale: page padding `p-4` mobile / `p-6` desktop (keep), section gap `space-y-6`, card internal gap `gap-4`

**Files affected:** All page files, `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, form components

### 5. Loading States and Transitions

**Skeleton loaders:**
- Create a reusable `<Skeleton>` component (shadcn already has one, ensure it's installed)
- Replace all spinner emojis with contextual skeletons that match the layout they're loading
- Each layout (`client/layout.tsx`, `owner/layout.tsx`) gets a proper skeleton with nav placeholder
- Individual pages get `loading.tsx` files with content-aware skeletons

**Page transitions:**
- Add subtle fade-in for page content using CSS animation (`animate-in fade-in duration-200`)
- Cards stagger-animate on page load (optional, can be done with `animation-delay` on children)

**Micro-interactions:**
- Button press: `active:scale-95 transition-transform duration-100`
- Toggle/switch: already animated via shadcn, verify smoothness
- Toast notifications: move from `top-right` to `top-center` on mobile for better visibility
- Success states: brief scale-up pulse on reward redemptions, point earnings

**Files affected:** `src/app/client/layout.tsx`, `src/app/owner/layout.tsx`, new `src/app/client/loading.tsx`, new `src/app/owner/loading.tsx`, new `src/app/client/*/loading.tsx` per route, `src/components/ui/skeleton.tsx`, `src/app/layout.tsx` (Toaster position)

### 6. Mobile-Native Patterns

**Sticky headers:**
- Already partially implemented (`sticky top-0 backdrop-blur`) -- enhance with `border-b` that fades in on scroll
- Add page title to header on mobile (currently just "Loyalty" branding)

**Bottom sheets:**
- Replace `Dialog` with bottom sheet pattern on mobile for quick actions (e.g., confirm redemption, quick-add client)
- Use shadcn `Drawer` component (Vaul) -- it already provides a mobile-native bottom sheet
- Dialogs remain on desktop; bottom sheets on mobile via responsive conditional

**List interactions:**
- Client/employee/service lists: tappable full-width rows with chevron indicator
- Swipe-to-action on list items (optional, phase 2) for quick delete/edit

**Empty states:**
- Replace bare text with illustrated empty states (icon + message + CTA button)
- Consistent pattern across all list views

**Files affected:** All list pages, new `src/components/ui/empty-state.tsx`, `src/components/ui/bottom-sheet.tsx` (or use Drawer from shadcn), all pages using Dialog for mobile

## Scope

### Core files (high impact)
- `src/app/globals.css` -- color palette overhaul
- `src/components/layout/*` -- navigation redesign (4 files + 2 new)
- `src/app/client/layout.tsx` -- bottom tab bar integration
- `src/app/owner/layout.tsx` -- improved mobile nav
- `src/components/ui/card.tsx` -- card visual upgrade

### Per-route files (medium impact)
- All 14 page files under `src/app/client/` and `src/app/owner/` -- spacing, typography, card usage adjustments
- New `loading.tsx` files for each route (~14 files)

### New components
- `src/components/layout/bottom-tab-bar.tsx`
- `src/components/layout/fab.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/stat-card.tsx`

### Estimated effort
- **Phase 1** (Navigation + Colors + Cards): ~3-4 sessions
- **Phase 2** (Loading states + Transitions + Per-page polish): ~2-3 sessions
- **Phase 3** (Bottom sheets + Empty states + Final polish): ~1-2 sessions

## Implementation Order

1. **Color palette** (globals.css) -- foundational, everything builds on this
2. **Card system** (card.tsx + stat-card) -- used everywhere, high visual impact
3. **Client bottom tab bar** -- biggest UX improvement for the primary user role
4. **Owner mobile nav improvement** -- second role, similar effort
5. **Loading skeletons** -- replace spinners across all layouts and pages
6. **Transitions and micro-interactions** -- polish layer
7. **Bottom sheets and empty states** -- final native-feel enhancements

## Rollback Plan

- All changes are CSS/component-level with no data model or API changes
- Git branch `feat/mobile-first-ui` allows full revert via branch switch
- Color changes are isolated to CSS custom properties in `globals.css` -- reverting one file restores the old palette
- Navigation changes are isolated to `src/components/layout/` -- reverting that folder restores sidebar-first pattern
- Card changes in `card.tsx` are backward-compatible (only class changes)

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| **Bottom tab bar hides content** on short screens | Medium | Use `pb-16` safe area on mobile to account for tab bar height; test on small devices (iPhone SE) |
| **Color palette change breaks contrast** in some contexts | Medium | Run WCAG contrast checks on all text/background combinations before finalizing; test in bright outdoor light |
| **Too many loading.tsx files** increase maintenance | Low | Create reusable skeleton templates; most pages can share 2-3 skeleton patterns |
| **Performance impact** from transitions/animations | Low | Use CSS-only animations (GPU-accelerated `transform`, `opacity`); avoid JS-driven animations; test on low-end Android |
| **Drawer/bottom sheet conflicts** with existing Dialog usage | Medium | Use responsive conditional rendering (`useMediaQuery` hook); keep Dialog on desktop, Drawer on mobile |
| **Owner nav grouping** changes mental model | Low | Keep same items, just group them logically; user testing recommended after implementation |
