# Budget Feature Business Rules

## Scope
These rules define expected behavior for budget-related UI and interactions under `src/app/components/budget-docs`.

## Core Rules
1. A budget item must include a category and a numeric amount.
2. Budget amount must be a positive value greater than 0.
3. Category names must map to the allowed application categories.
4. Budget values should be stored and displayed with consistent currency formatting.

## UI Rules
1. Budget information should be readable at a glance and grouped logically.
2. Empty budget state must be explicit and user-friendly.
3. Editing budget values should not require a full page refresh.

## Validation Rules
1. Invalid amounts (empty, non-numeric, or <= 0) must be rejected.
2. Unknown categories must be rejected.
3. Validation errors should be shown inline near the relevant input.

## Consistency Rules
1. Budget totals and per-category values must remain consistent after create or update operations.
2. UI should update immediately after successful mutations.
3. Server-side source of truth must remain authoritative when optimistic updates are used.
