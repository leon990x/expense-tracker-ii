# docs — Technical Notes

> Source: src/components/docs/TECHNICAL-NOTES.md  
> Last updated: 2026-04-12

## Overview

DollarVis is built on Next.js 14+ with the App Router, TypeScript, Tailwind CSS, and a local SQLite database. The architecture draws a clear boundary between server components (data fetching and layout), client components (interactive UI), and server actions (mutations). Persistence is handled entirely through a local SQLite file, with cache revalidation driving a no-refresh UI after each write.

## Notes

### Stack and Runtime

- Framework: Next.js 14+ with App Router
- Language: TypeScript (strict typing expected)
- UI: Tailwind CSS + Lucide React icons
- Storage: local SQLite database (`data/expense-tracker.sqlite`) via `src/lib/sqlite.ts` / `getDb()`

### Key Architectural Boundaries

1. Use server components for data fetch and static layout composition.
2. Use client components only where interactivity is required (tile expansion, inline forms, optimistic UI).
3. Keep server mutations in server actions (`'use server'`) under the library layer.

### Core Files and Responsibilities

| File | Responsibility |
|---|---|
| `src/types/expense.ts` | Canonical `Expense` and `Category` type definitions |
| `src/lib/actions.ts` | Read/write mutation logic and cache revalidation |
| `src/components/SummaryTile.tsx` | Expansion state, grouped rendering, inline add/edit entry points |
| `src/components/ExpenseForm.tsx` | Create/edit form handling and validation |
| `src/components/ExpenseDashboard.tsx` | Period-level composition of summary tiles |
| `src/components/AppNavigation.tsx` | Top-level app navigation links and active-route styling |

### AppNavigation.tsx Technical Notes

1. `AppNavigation.tsx` is a client component because it uses `usePathname()` from `next/navigation`.
2. Active state styling is computed in `getTileClassName(href)` using exact equality (`pathname === href`).
3. Navigation uses `next/link` for route transitions to preserve Next.js client-side navigation behavior.
4. The component currently renders two links only: `/` (Dashboard) and `/budget` (Budget).
5. Shared Tailwind utility classes are centralized in `getTileClassName` to keep active and inactive variants consistent.
6. Accessibility baseline is provided via `nav[aria-label="Primary"]`; link text remains the accessible name.

### Mutation Flow

1. Client form submits payload to a server action.
2. Server action applies the mutation through `getDb()` (SQLite) and persists changes to `data/expense-tracker.sqlite`.
3. The mutation revalidates both `revalidatePath('/')` and `revalidatePath('/budget')` so the dashboard and budget views rerender with current data.
4. UI should remain responsive and avoid a full-page refresh pattern while keeping both routes in sync after a mutation.

### Data Handling Notes

1. Keep category strings aligned with the `Category` union type to avoid invalid data.
2. Preserve numeric precision for `amount` values and present currency with consistent formatting.
3. Ensure date parsing and grouping are deterministic (avoid mixed timezone assumptions).
4. Treat IDs as immutable keys across rendering and edits.

### Operational Constraints

1. SQLite storage is not concurrency-safe under heavy parallel writes without additional locking.
2. If write contention appears, consider introducing WAL mode or migrating to a transactional server-side store.
3. For now, architecture is optimized for local development and lightweight single-user usage.

### Documentation and Wiki Sync Notes

1. Markdown docs can be synchronized to the GitHub Wiki via `.github/workflows/wiki-sync.yml`.
2. The sync workflow uses `GITHUB_TOKEN` and commits to `<repo>.wiki.git`.
3. Keep docs focused on implementation details, behavior, and file ownership to improve maintainability.

## Related Pages

- [docs-Business-Rules](docs-Business-Rules.md) — Business rules covering expense domain, categories, and dashboard behaviour
- [AppNavDocs-Business-Rules](AppNavDocs-Business-Rules.md) — AppNavigation routing and navigation rules
- [ExpenseForm-Doc](ExpenseForm-Doc.md) — ExpenseForm component documentation
