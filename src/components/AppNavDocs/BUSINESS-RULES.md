# App Navigation Business Rules

## Scope
These rules define expected behavior for app navigation documentation under src/app/components/AppNavDocs.

## Route Rules
1. Navigation must include Dashboard route at /.
2. Navigation must include Budget route at /budget.
3. Route-to-label mapping must remain stable unless explicitly changed in requirements.

## Active State Rules
1. Only one navigation item can be active at a time.
2. Active state must be based on exact pathname matching.
3. Inactive links must not visually appear active.

## Interaction Rules
1. Navigation entries must use link semantics for keyboard and browser compatibility.
2. Hover treatment applies to inactive links only.
3. Navigation must remain available wherever top-level route switching is expected.

## Accessibility Rules
1. Primary navigation must be wrapped in a nav container with an appropriate aria-label.
2. Destination labels must be clear and human-readable.
3. Focus and contrast must remain visible for all navigation states.

## Consistency Rules
1. Styling variants for active and inactive links should be centralized to prevent drift.
2. Any new top-level route must update both implementation and corresponding docs.
3. Changes to route behavior should be reflected in wiki-generated docs on the next sync.
