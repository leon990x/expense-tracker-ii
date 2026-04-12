# docs — Business Rules

> Source: src/components/docs/BUSINESS-RULES.md  
> Last updated: 2026-04-12

## Overview

DollarVis is a personal expense tracker that stores and categorises spending and surfaces totals through Daily, Weekly, and Monthly dashboard summary tiles. These rules define the valid shapes of expense data, the allowed category vocabulary, expected dashboard behaviour, persistence strategy, UX integrity guarantees, and the routing rules for app navigation.

## Rules

### Expense Domain Rules

1. Every expense must include `amount`, `category`, `date`, and `description`.
2. `amount` must be a positive number greater than zero (0).
3. `date` must be stored as an ISO 8601 string.
4. `description` should be human-readable and non-empty.
5. `id` is system-generated and must remain stable after creation.

### Category Rules

1. Allowed categories are Food, Transport, Housing, Entertainment, Utilities, Healthcare, Merchandise, Investments, Subscriptions, Coffee, and Other.
2. Category values are strict and case-sensitive to keep aggregation reliable.
3. Summary breakdowns must group totals by category.

### Dashboard Behaviour Rules

1. The dashboard exposes three summary tiles: Daily, Weekly, and Monthly.
2. Each tile must be clickable and toggle expanded/collapsed state.
3. Expanded tiles must show expense rows grouped by category.
4. Add/Edit actions must appear inline in or directly below the expanded tile.
5. The user flow must feel no-refresh after mutations.

### Data and Persistence Rules

1. Expenses are stored in a local SQLite database file (`data/expense-tracker.sqlite`).
2. No external database service is used in the current architecture; persistence is handled locally through SQLite.
3. Add/Edit operations are executed through the server-side persistence layer backed by `src/lib/sqlite.ts`.
4. After each mutation, the home route is revalidated so totals and lists refresh immediately.

### Integrity and UX Rules

1. Totals shown in summary tiles must always equal the sum of included expenses for that period.
2. Empty states must be explicit (for example, showing no expenses for a period).
3. New entries should become visible in the correct date bucket immediately after save.
4. Editing an expense must update all affected aggregates (daily, weekly, monthly) consistently.

### AppNavigation.tsx Business Rules

1. Primary navigation must expose exactly two top-level destinations: Dashboard (`/`) and Budget (`/budget`).
2. The currently active route must be visually distinct from inactive routes.
3. Route matching for active state is exact path equality to avoid ambiguous highlighting.
4. Navigation must remain visible and consistent across pages where the main app shell is rendered.
5. Navigation controls must be keyboard accessible through standard link behavior.
6. The navigation container must preserve semantic meaning by using a `nav` element with `aria-label="Primary"`.

## Related Pages

- [AppNavDocs-Business-Rules](AppNavDocs-Business-Rules.md) — AppNavigation-specific routing and navigation rules
- [docs-Technical-Notes](docs-Technical-Notes.md) — Technical implementation notes for these domains
- [ExpenseForm-Doc](ExpenseForm-Doc.md) — ExpenseForm component documentation
