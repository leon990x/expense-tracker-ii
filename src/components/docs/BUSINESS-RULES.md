# Business Rules

## Purpose
DollarVis tracks personal expenses and budgets, presenting totals through Daily, Weekly, and Monthly dashboard summaries. The product goal is fast entry and immediate visibility into spending patterns, with per-category budget limits tracked on a separate Budget page.

## Expense Domain Rules
1. Every expense must include `amount`, `category`, `date`, and `description`.
2. `amount` must be a positive finite number greater than zero (`0`).
3. `date` must be stored as an ISO 8601 string. Date-only inputs are normalized to midday (`T12:00:00`) before conversion to avoid timezone boundary shifts.
4. `description` should be human-readable; it may be empty but must not be null.
5. `id` is system-generated via `randomUUID()` and must remain stable after creation — never overwrite or reuse an existing ID.

## Category Rules
1. Allowed categories are: `Food`, `Transport`, `Housing`, `Entertainment`, `Utilities`, `Healthcare`, `Merchandise`, `Investments`, `Subscriptions`, `Coffee`, and `Other`.
2. Category values are strict, case-sensitive, and must satisfy the `Category` union type defined in `src/types/expense.ts`.
3. Summary breakdowns and budget limit comparisons must group totals by category.
4. Any new category must be added to the `Category` type first; the UI category list must stay in sync with it.

## Dashboard Behavior Rules
1. The dashboard exposes three summary tiles: Daily, Weekly, and Monthly.
2. Each tile must be clickable and toggle an expanded/collapsed state.
3. Expanded tiles must show expense rows grouped by category.
4. Add and Edit actions must appear inline in or directly below the expanded tile — never in a modal or a separate page.
5. The user flow must feel no-refresh after mutations; `revalidatePath` handles server-side cache invalidation.

## Budget Domain Rules
1. Budget limits are configurable per category per timeframe (daily, weekly, monthly).
2. A limit value of `-1` represents "no limit set" for that category/timeframe combination.
3. Budget limits are stored in `budget_limits` (SQLite) and read via `getBudget()` in `src/lib/actions.ts`.
4. Updating a budget limit must upsert (insert or replace) rather than error on conflict.
5. Over-budget status is derived by comparing actual spend totals against the stored limit — it is never stored directly.

## Data and Persistence Rules
1. Expenses and budget limits are stored in a local SQLite database file (`data/expense-tracker.sqlite`).
2. No external database service is used; persistence is handled locally through `src/lib/sqlite.ts`.
3. Add, Edit, and Delete operations are executed through server actions in `src/lib/actions.ts`.
4. After each mutation, both `revalidatePath('/')` and `revalidatePath('/budget')` are called so the dashboard and budget views refresh immediately.

## Integrity and UX Rules
1. Totals shown in summary tiles must always equal the sum of included expenses for that period.
2. Empty states must be explicit (e.g., show a "no expenses" message rather than a blank tile).
3. New entries must become visible in the correct date bucket immediately after save.
4. Editing an expense must update all affected aggregates (daily, weekly, monthly) consistently.
5. Deleting an expense must remove it from all period buckets and recalculate affected totals.

## AppNavigation Rules
1. Primary navigation must expose exactly two top-level destinations: Dashboard (`/`) and Budget (`/budget`).
2. The currently active route must be visually distinct from inactive routes.
3. Route matching for active state uses exact path equality to avoid ambiguous highlighting.
4. Navigation must remain visible and consistent across all pages rendered inside the main app shell.
5. Navigation controls must be keyboard accessible through standard `<Link>` semantics.
6. The navigation container must preserve semantic meaning via `<nav aria-label="Primary">`.
