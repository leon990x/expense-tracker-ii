# AppNavDocs — Business Rules

> Source: src/components/AppNavDocs/BUSINESS-RULES.md  
> Last updated: 2026-04-12

## Overview
The App Navigation component (`AppNavigation.tsx`) manages top-level routing between the Dashboard (`/`) and Budget (`/budget`) pages. These rules define the expected routing, active-state, interaction, accessibility, and consistency behaviour for the navigation layer and its documentation.

## Rules

### Scope
These rules apply to app routing and navigation documentation under `src/components/AppNavDocs`.

### Route Rules
1. Navigation must include a Dashboard route at `/`.
2. Navigation must include a Budget route at `/budget`.
3. Route-to-label mapping must remain stable unless explicitly changed in requirements.

### Active State Rules
1. Only one navigation item can be active at a time.
2. Active state must be based on exact pathname matching.
3. Inactive links must not visually appear active.

### Interaction Rules
1. Navigation entries must use link semantics for keyboard and browser compatibility.
2. Hover treatment applies to inactive links only.
3. Navigation must remain available wherever top-level route switching is expected.

### Accessibility Rules
1. Primary navigation must be wrapped in a `nav` container with an appropriate `aria-label`.
2. Destination labels must be clear and human-readable.
3. Focus and contrast must remain visible for all navigation states.

### Consistency Rules
1. Styling variants for active and inactive links should be centralized to prevent drifting.
2. Any new top-level route must update both implementation and corresponding docs.
3. Changes to route behavior should be reflected in wiki-generated docs on the next sync.

## Related Pages
- [Business Rules Index](Business-Rules.md)
