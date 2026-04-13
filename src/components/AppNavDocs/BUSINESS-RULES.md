# AppNavigation — Business Rules

## Scope
These rules define expected behavior for the `AppNavigation` component (`src/components/AppNavigation.tsx`) and the app-level routing it governs.

## Route Rules
1. Navigation must expose exactly two top-level destinations: Dashboard (`/`) and Budget (`/budget`).
2. Route-to-label mapping must remain stable unless explicitly changed in requirements.
3. Any new top-level route must update both the component implementation and the docs in this directory.

## Active State Rules
1. Only one navigation item can be active at a time.
2. Active state is determined by **exact pathname equality** (`pathname === href`) using `usePathname()` from `next/navigation`. Partial or prefix matching must not be used.
3. Inactive links must not visually appear active under any circumstance, including during client-side navigation transitions.
4. All active and inactive style variants are centralized in `getTileClassName(href)` — do not derive or override active styles outside this function.
5. The active variant applies: `border-sky-300 bg-slate-50 text-sky-800`.
6. The inactive variant applies: `border-slate-200 bg-slate-50 text-slate-700` with hover state `hover:border-slate-300 hover:bg-slate-100`.
7. Adding a new style state (e.g. disabled, loading) requires adding a dedicated branch inside `getTileClassName` — do not use inline ternaries on `<Link>` elements.

## Interaction Rules
1. Navigation entries must use `next/link` for client-side route transitions.
2. Hover treatment applies to inactive links only; active links must not show a hover style.
3. Navigation must remain visible and consistent across all pages where the main app shell (`RootLayout`) is rendered.

## Accessibility Rules
1. The navigation container must use a `<nav>` element with `aria-label="Primary"`.
2. Link text must be the accessible name — do not hide it behind icons without a visible label.
3. Focus and contrast must remain visible for all navigation states.

## Implementation Notes
1. `AppNavigation.tsx` is a client component because it reads `usePathname()`.
2. Style logic must stay in `getTileClassName` — do not inline conditional classes directly on `<Link>` elements.
3. Changes to routing behavior must be reflected in this document and in `src/components/docs/BUSINESS-RULES.md`.
