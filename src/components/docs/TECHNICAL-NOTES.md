# Technical Notes

## Stack and Runtime
- Framework: Next.js 14+ with App Router
- Language: TypeScript (strict typing enforced — avoid `any`)
- UI: Tailwind CSS (utility-first, no CSS modules) + Lucide React icons
- Storage: local SQLite database (`data/expense-tracker.sqlite`) via `src/lib/sqlite.ts` / `getDb()`

## Key Architectural Boundaries
1. Use server components for data fetching and static layout composition.
2. Use client components (`'use client'`) only where interactivity is required — tile expansion, inline forms, optimistic UI.
3. Keep all server mutations in server actions (`'use server'`) under `src/lib/actions.ts`.
4. Never call `getDb()` directly from a client component or a page component; always go through an action.

## Core Files and Responsibilities
| File | Responsibility |
|---|---|
| `src/types/expense.ts` | Canonical `Expense`, `Category`, and `DailySummary` definitions |
| `src/types/budget.ts` | `BudgetData`, `BudgetTimeframe` definitions |
| `src/lib/sqlite.ts` | SQLite connection helper (`getDb()`), schema bootstrap, `defaultBudgetData` |
| `src/lib/actions.ts` | All server actions: read/write mutations and `revalidatePath` calls |
| `src/components/SummaryTile.tsx` | Expansion state, grouped rendering, inline add/edit entry points |
| `src/components/ExpenseForm.tsx` | Create/edit form handling, validation, and optimistic updates |
| `src/components/ExpenseDashboard.tsx` | Period-level composition of summary tiles |
| `src/components/BudgetDashboard.tsx` | Budget page composition, per-category limit display |
| `src/components/BudgetCard.tsx` | Individual budget category card with spend vs. limit comparison |
| `src/components/AppNavigation.tsx` | Top-level app navigation links and active-route styling |

## AppNavigation Technical Notes
1. `AppNavigation.tsx` is a client component because it uses `usePathname()` from `next/navigation`.
2. Active state styling is computed in `getTileClassName(href)` using exact equality (`pathname === href`).
3. Navigation uses `next/link` for route transitions to preserve Next.js client-side navigation behavior.
4. The component renders exactly two links: `/` (Dashboard) and `/budget` (Budget).
5. Shared Tailwind utility classes are centralized in `getTileClassName` to keep active and inactive variants consistent and prevent drift.
6. Accessibility baseline: `<nav aria-label="Primary">` — link text is the accessible name.

## Server Actions — Available Operations
| Action | Description |
|---|---|
| `getExpenses()` | Returns all expenses ordered by date descending; bypasses cache with `noStore()` |
| `addExpense(expense)` | Inserts a new expense row; revalidates `/` and `/budget` |
| `editExpense(id, updates)` | Updates an existing expense by ID; revalidates `/` and `/budget` |
| `deleteExpense(id)` | Deletes an expense by ID; revalidates `/` and `/budget` |
| `getBudget()` | Returns full `BudgetData` keyed by timeframe and category |
| `updateBudgetLimit(timeframe, category, limit)` | Upserts a budget limit; `-1` means "no limit" |

## Mutation Flow
1. Client form submits payload to a server action.
2. Server action validates the input, then calls `getDb()` and executes the SQL mutation against `data/expense-tracker.sqlite`.
3. The action calls `revalidatePath('/')` and `revalidatePath('/budget')` so both views rerender with current data.
4. Optimistic UI (`useOptimistic`) on the client reflects the change immediately before the server round-trip completes.

## Data Handling Notes
1. Keep category strings aligned with the `Category` union type — do not hard-code strings elsewhere.
2. Preserve numeric precision for `amount` values and present currency with consistent formatting (e.g., `toFixed(2)`).
3. Date inputs are normalized to `${date}T12:00:00` before `toISOString()` to reduce timezone boundary shifts.
4. Treat `id` values as immutable keys — never mutate an ID across renders or edits.

## Operational Constraints
1. SQLite is not concurrency-safe under heavy parallel writes without additional locking.
2. If write contention becomes an issue, consider enabling WAL mode (`PRAGMA journal_mode=WAL`) or migrating to a server-side transactional store.
3. The current architecture is optimized for local development and lightweight single-user usage.

## Documentation and Wiki Sync Notes
1. Markdown docs can be synchronized to the GitHub Wiki via `.github/workflows/wiki-sync.yml`.
2. The sync workflow uses `GITHUB_TOKEN` and commits wiki output to `<repo>.wiki.git` from the `wiki/` folder.
3. Source documents matching `BUSINESS-RULES.md`, `TECHNICAL-NOTES.md`, or `*.doc.md` are picked up automatically by the wiki-sync skill.
4. Keep docs focused on implementation details, behavior, and file ownership to improve maintainability.
