# App Navigation Business Rules

## Scope
These rules define expected behavior for the primary app navigation implemented by `src/components/AppNavigation.tsx`.

## Navigation Availability
1. Primary navigation must expose exactly two routes: Dashboard (`/`) and Budget (`/budget`).
2. Navigation links must be visible in the shared app shell where route switching is expected.

## Active Route Rules
1. Active route highlighting must be based on exact pathname matching.
2. At most one navigation tile can appear active at a time.
3. If pathname does not match a known route exactly, no tile should be marked active.

## Interaction Rules
1. Navigation items must be standard links so keyboard and browser navigation behaviors remain intact.
2. Hover styling must be applied only to inactive links.
3. Active styling must remain visually distinct from inactive and hover states.

## Accessibility Rules
1. Navigation container must use semantic `nav` markup with `aria-label="Primary"`.
2. Link text must clearly communicate destination intent.
3. Visual styles must preserve readability and contrast in both active and inactive states.

## Consistency Rules
1. Dashboard link text should always map to `/`.
2. Budget link text should always map to `/budget`.
3. Style tokens for active/inactive states should remain centralized to avoid drift between links.
