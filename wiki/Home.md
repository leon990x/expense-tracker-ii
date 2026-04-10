# DollarVis — Wiki

**DollarVis** is a Next.js expense-tracking dashboard that lets you log expenses, set per-category budget limits, and view spending summaries across daily, weekly, and monthly timeframes — all with optimistic UI and no full-page reloads.

## Pages

| Route | Description |
|---|---|
| `/` | Expense dashboard — add, edit, delete expenses; view summaries by timeframe |
| `/budget` | Budget dashboard — compare spending against per-category limits |

## Dashboards

- [ExpenseDashboard](ExpenseDashboard) — summary tiles with inline expense management and optimistic updates
- [BudgetDashboard](BudgetDashboard) — daily / weekly / monthly budget-vs-spent breakdown

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data**: Local JSON / SQLite file storage (no external database)
- **Mutations**: Server Actions with `revalidatePath` for instant UI refresh

## Project Layout

```
/app          Next.js App Router pages (Home, Budget)
/components   UI components (SummaryTile, ExpenseForm, BudgetCard, …)
/lib          Server actions and data helpers
/types        TypeScript interfaces (Expense, Category, Budget)
/data         Local data store
/wiki         Source files for this wiki
```
