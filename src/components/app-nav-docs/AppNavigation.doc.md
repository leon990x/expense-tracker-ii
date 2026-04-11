# AppNavigation

## Overview
`AppNavigation` is a client component that renders the primary route switcher for the app. It uses the current pathname to render active/inactive tile styling for navigation links.

## Source
- Component: `src/components/AppNavigation.tsx`

## Key Responsibilities
1. Read the current route pathname via `usePathname()`.
2. Render links for Dashboard (`/`) and Budget (`/budget`).
3. Compute route-aware class names so active destination is visually emphasized.

## Implementation Notes
- The component is marked with `'use client'` because it uses `usePathname()` from `next/navigation`.
- `getTileClassName(href)` computes class names with a shared base style plus active/inactive variants.
- Active rule is exact match: `pathname === href`.
- Inactive state includes hover styles for interactive affordance.

## Rendering Structure
- Root element: `<nav aria-label="Primary">`
- Children:
  - `<Link href="/">Dashboard</Link>`
  - `<Link href="/budget">Budget</Link>`

## Style Behavior
- Shared tile base: rounded border, spacing, small bold text, transition.
- Active tile: sky border/text treatment with slate background.
- Inactive tile: slate border/text treatment with hover border/background changes.

## Integration Expectations
- Place in layout/header region where primary app navigation should always be reachable.
- Keep link list synchronized with supported top-level routes.
- If new top-level routes are added, update both link set and business rules docs.

## Testing Checklist
- [ ] `/` highlights Dashboard and not Budget.
- [ ] `/budget` highlights Budget and not Dashboard.
- [ ] Keyboard focus and Enter activation work on both links.
- [ ] Inactive hover styles apply only when the link is not active.
