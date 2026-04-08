# Actions Service

`src/lib/actions.ts` is the central server-action layer for DollarVis. All functions are marked `'use server'` and run exclusively on the server, communicating with the SQLite database via the `getDb` helper from `lib/sqlite`.

After any mutation, each action calls `revalidatePath('/')` and `revalidatePath('/budget')` so the Next.js cache is invalidated and the UI refreshes without a full page reload.

---

## Expense Actions

### `getExpenses(): Promise<Expense[]>`

Reads all rows from the `expenses` table, ordered newest-first by their ISO date string. Uses `unstable_noStore` to opt out of static caching.

### `addExpense(expense: Omit<Expense, 'id'>): Promise<void>`

Inserts a new expense row. A UUID is generated server-side via Node's `crypto.randomUUID()` so clients never control the primary key.

### `editExpense(id: string, updates: Omit<Expense, 'id'>): Promise<void>`

Updates `amount`, `category`, `date`, and `description` for the given expense `id`.

### `deleteExpense(id: string): Promise<void>`

Deletes the expense row matching `id`.

---

## Budget Actions

### `getBudget(): Promise<BudgetData>`

Reads all rows from `budget_limits` and assembles them into a `BudgetData` object keyed by timeframe (`daily` | `weekly` | `monthly`) and `Category`. Any category not present in the database falls back to `defaultBudgetData` values.

### `updateBudgetLimit(timeframe, category, limit): Promise<void>`

Upserts a budget limit using an `INSERT … ON CONFLICT DO UPDATE` statement. A `limit` of `-1` signals "no limit"; any other value is sanitised to a non-negative finite number before being written.

---

## Related Files

| File | Purpose |
|------|---------|
| `src/lib/sqlite.ts` | Opens / initialises the SQLite database and exposes `defaultBudgetData` |
| `src/types/expense.ts` | `Expense` and `Category` types |
| `src/types/budget.ts` | `BudgetData` and `BudgetTimeframe` types |
