# AppNavDocs — Business Rules

> Source: src/components/AppNavDocs/BUSINESS-RULES.md  
> Last updated: 2026-04-12

## Overview

These rules define the expected routing and navigation behaviour for the app shell navigation component. They govern which routes must be exposed, how active state is determined, interaction requirements, accessibility obligations, and the conventions for keeping navigation implementation and documentation in sync over time.

## Rules

### Route Rules

1. Navigation must include the dashboard route at `/`.
2. Navigation must include the budget route at `/budget`.
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

1. Styling for active and inactive links should be centralized to prevent drift.
2. Any new top-level route must update both implementation and corresponding docs.
3. Changes to route behavior should be reflected in the source documentation in this directory when the implementation changes.

## Related Pages

- [docs-Business-Rules](docs-Business-Rules.md) — Broader app business rules including AppNavigation rules
- [docs-Technical-Notes](docs-Technical-Notes.md) — Technical notes for AppNavigation implementation details
