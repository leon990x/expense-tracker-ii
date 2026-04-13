# Budget — Technical Notes

## Overview

The budgeting feature lets users set per-category spending limits across three timeframes (daily, weekly, monthly) and tracks actual spend against those limits in real time. It spans four layers: a SQLite database, server actions, a server-rendered page, and two client components.

## File Map

| File | Role |
|---|---|
| `src/app/budget/page.tsx` | Server Component — fetches data, filters expenses by timeframe, builds row data |
| `src/components/BudgetDashboard.tsx` | Client Component — manages expanded/collapsed state across all three cards |
| `src/components/BudgetCard.tsx` | Client Component — renders one timeframe card; owns inline edit state |
| `src/types/budget.ts` | TypeScript types for budget data |
| `src/lib/actions.ts` | Server Actions — `getBudget`, `updateBudgetLimit` |
| `src/lib/sqlite.ts` | SQLite setup — `budget_limits` table schema, `getDb` singleton |

## Data Model

### `budget_limits` table (SQLite)

```sql
CREATE TABLE IF NOT EXISTS budget_limits (
  timeframe TEXT NOT NULL,       -- 'daily' | 'weekly' | 'monthly'
  category  TEXT NOT NULL,       -- Category union type value
  limit_amount REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (timeframe, category)
);
```

All 33 rows (11 categories × 3 timeframes) are pre-seeded on first database open via `ensureAllBudgetRows` in `sqlite.ts`, so `getBudget` always returns a full `BudgetData` object with no missing keys.

### TypeScript types (`src/types/budget.ts`)

```ts
export type BudgetTimeframe = "daily" | "weekly" | "monthly";
export type BudgetLimits = Record<Category, number>;

export interface BudgetData {
  daily: BudgetLimits;
  weekly: BudgetLimits;
  monthly: BudgetLimits;
}

export interface BudgetCategoryRow {
  category: Category;
  spent: number;    // computed from expenses
  limit: number;    // -1 means "No Limit"
}
```

### Sentinel value: `-1` means "No Limit"

A `limit` of `-1` (`UNLIMITED_LIMIT`) signals that no cap is applied. This value is stored in SQLite and propagated through to the UI. `updateBudgetLimit` sanitizes input: only `-1` or a finite non-negative number is accepted; anything else is coerced to `0`.

## Data Flow

```
budget/page.tsx (Server)
  ├── getExpenses()         → all expenses from SQLite
  ├── getBudget()           → all budget_limits from SQLite
  ├── filter expenses by timeframe (isSameDay / isDateInRange / isSameMonth)
  ├── buildRows(expenses, limits) → BudgetCategoryRow[]  (one per category, in categoryOrder)
  └── passes dailyRows / weeklyRows / monthlyRows to <BudgetDashboard>

BudgetDashboard (Client)
  └── manages expandedTiles: Set<BudgetTileId>  (defaults to {"month"} expanded)
      └── passes isExpanded + onToggle to each <BudgetCard>

BudgetCard (Client)
  ├── localRows: BudgetCategoryRow[]  — optimistic local copy of rows prop
  ├── editingCategory: Category | null
  ├── draftLimit: string
  └── on save → updateBudgetLimit() server action → router.refresh()
```

## Week Boundary Calculation

The weekly timeframe uses Monday as the first day of the week:

```ts
const getWeekRange = (date: Date) => {
  const dayIndex = date.getDay();               // 0 = Sunday
  const offset = dayIndex === 0 ? -6 : 1 - dayIndex;
  start.setDate(date.getDate() + offset);       // Monday 00:00:00
  end.setDate(start.getDate() + 7);             // next Monday 00:00:00
};
```

Expenses are included when `date >= start && date < end` (exclusive upper bound).

## Optimistic UI in BudgetCard

`BudgetCard` keeps a `localRows` copy of the `rows` prop and updates it immediately on save, before the server action resolves. If the server action throws, it rolls back to `previousRows`. On success it calls `router.refresh()` to re-sync from the server.

`setNoLimit` follows the same optimistic pattern, setting `limit` to `-1` locally before persisting.

## Progress Bar States

Each category row computes `ratio = spent / limit` and renders a coloured progress bar:

| State | Condition | Bar colour |
|---|---|---|
| Normal | `ratio < 0.8` | `bg-[#0072C1]` (brand blue) |
| Near limit | `0.8 ≤ ratio < 1.0` | `bg-orange-500` |
| Over budget | `ratio ≥ 1.0` (or `spent > 0` when limit is `0`) | `bg-rose-500` |
| No limit | `limit === -1` | progress bar hidden (ratio forced to `0`) |

Bar width is clamped: `Math.min(100, Math.max(0, ratio * 100))%`.

## Server Actions

### `getBudget(): Promise<BudgetData>`
Reads all rows from `budget_limits` and reconstructs the typed `BudgetData` object. Uses `unstable_noStore()` to opt out of Next.js caching so limits are always fresh.

### `updateBudgetLimit(timeframe, category, limit): Promise<void>`
Uses an `INSERT ... ON CONFLICT DO UPDATE` upsert. Sanitizes the limit value:
- `-1` → stored as-is (No Limit)
- finite and `>= 0` → stored as-is
- anything else → coerced to `0`

Calls `revalidatePath('/')` and `revalidatePath('/budget')` after mutation.

## Category Order

Categories are rendered in a fixed display order defined in `budget/page.tsx`:

```ts
const categoryOrder: Category[] = [
  "Food", "Transport", "Housing", "Entertainment",
  "Utilities", "Healthcare", "Merchandise", "Investments",
  "Subscriptions", "Coffee", "Other",
];
```

This order governs both the row sequence in the UI and the array produced by `buildRows`.

## Extending the Budget Feature

**Adding a new category:**
1. Add the value to the `Category` union in `src/types/expense.ts`.
2. Add it to `allCategories` in `src/lib/sqlite.ts` — `ensureAllBudgetRows` will seed the new rows on next startup.
3. Add it to `categoryOrder` in `src/app/budget/page.tsx` at the desired display position.

**Adding a new timeframe:**
1. Add the value to `BudgetTimeframe` in `src/types/budget.ts`.
2. Add it to `allTimeframes` in `src/lib/sqlite.ts`.
3. Add the corresponding expense filter function in `budget/page.tsx`.
4. Add a new `<BudgetCard>` in `BudgetDashboard.tsx` and extend `BudgetTileId`.
