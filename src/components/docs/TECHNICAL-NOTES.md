# Technical Notes

## Stack and Runtime
- Framework: Next.js 14+ with NEXT App Router
- Language: TypeScript (strict typing expected)
- UI: Tailwind CSS + Lucide React icons
- Storage: local SQLite database (`data/expense-tracker.sqlite`) via `src/lib/sqlite.ts`/`getDb()`

## Key Architectural Boundaries
1. Use server components for data fetch and static layout composition.
2. Use client components only where interactivity is required (tile expansion, inline forms, optimistic UI).
3. Keep server mutations in server actions (`'use server'`) under the library layer.

## Core Files and Responsibilities
- `src/types/expense.ts`: canonical `Expense` and `Category` definitions
- `src/lib/actions.ts`: read/write mutation logic and cache revalidation
- `src/components/SummaryTile.tsx`: expansion state, grouped rendering, inline add/edit entry points
- `src/components/ExpenseForm.tsx`: create/edit form handling and validation
- `src/components/ExpenseDashboard.tsx`: period-level composition of summary tiles
- `src/components/AppNavigation.tsx`: top-level app navigation links and active-route styling

## AppNavigation.tsx Technical Notes
1. `AppNavigation.tsx` is a client component because it uses `usePathname()` from `next/navigation`.
2. Active state styling is computed in `getTileClassName(href)` using exact equality (`pathname === href`).
3. Navigation uses `next/link` for route transitions to preserve Next.js client-side navigation behavior.
4. The component currently renders two links only: `/` (Dashboard) and `/budget` (Budget).
5. Shared Tailwind utility classes are centralized in `getTileClassName` to keep active and inactive variants consistent.
6. Accessibility baseline is provided via `nav[aria-label="Primary"]`; link text remains the accessible name.

## Mutation Flow
1. Client form submits payload to a server action.
2. Server action applies the mutation through `getDb()` (SQLite) and persists changes to `data/expense-tracker.sqlite`.
3. The mutation revalidates both `revalidatePath('/')` and `revalidatePath('/budget')` so the dashboard and budget views rerender with current data.
4. UI should remain responsive and avoid a full-page refresh pattern while keeping both routes in sync after a mutation.

## Data Handling Notes
1. Keep category strings aligned with the `Category` union type to avoid invalid data.
2. Preserve numeric precision for `amount` values and present currency with consistent formatting.
3. Ensure date parsing and grouping are deterministic (avoid mixed timezone assumptions).
4. Treat IDs as immutable keys across rendering and edits.

## Operational Constraints
1. SQLite storage is not concurrency-safe under heavy parallel writes without additional locking.
2. If write contention appears, consider introducing WAL mode or migrating to a transactional server-side store.
3. For now, architecture is optimized for local development and lightweight single-user usage.

## Documentation and Wiki Sync Notes
1. Markdown docs can be synchronized to the GitHub Wiki via `.github/workflows/wiki-sync.yml`.
2. The sync workflow uses `GITHUB_TOKEN` and commits to `<repo>.wiki.git`.
3. Keep docs focused on implementation details, behavior, and file ownership to improve maintainability.
