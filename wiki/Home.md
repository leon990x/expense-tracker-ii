# DollarVis — Wiki

**DollarVis** is a Next.js expense-tracking dashboard that lets you log expenses, set per-category budget limits, and view spending summaries across daily, weekly, and monthly timeframes — all with optimistic UI and no full-page reloads.

## Top-Level Wiki Sections

| Section | Description |
|---|---|
| [Business-Rules](Business-Rules) | Business rules governing expenses, categories, dashboard behavior, and navigation |
| [Technical-Notes](Technical-Notes) | Stack, architecture, mutation flow, and implementation constraints |
| [Docs](Docs) | Index of `*.doc.md` component documentation files |
| [Categories](Categories) | Domain/category index for all generated wiki pages |

> **Note:** The [Components](Categories/Components) category includes both **Business Rules** and **Technical Notes** sections sourced from `src/components/docs/`.

---

## Generated Pages

| Page | Kind | Source | Description |
|---|---|---|---|
| [src-components-docs-BUSINESS-RULES](Business-Rules#src-components-docs-business-rules) | Business Rules | `src/components/docs/BUSINESS-RULES.md` | Expense domain rules, category constraints, dashboard behavior, and AppNavigation rules |
| [src-components-docs-TECHNICAL-NOTES](Technical-Notes#src-components-docs-technical-notes) | Technical Notes | `src/components/docs/TECHNICAL-NOTES.md` | Stack, architectural boundaries, core files, mutation flow, and operational constraints |

---

## App Pages

| Route | Description |
|---|---|
| `/` | Expense dashboard — add, edit, delete expenses; view summaries by timeframe |
| `/budget` | Budget dashboard — compare spending against per-category limits |

## Dashboards

- [ExpenseDashboard](ExpenseDashboard) — summary tiles with inline expense management and optimistic updates
- [BudgetDashboard](BudgetDashboard) — daily / weekly / monthly budget-vs-spent breakdown

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict typing expected)
- **Styling**: Tailwind CSS + Lucide React icons
- **Storage**: Local SQLite database (`data/expense-tracker.sqlite`) via `src/lib/sqlite.ts`/`getDb()`
- **Mutations**: Server Actions (`'use server'`) with `revalidatePath` for instant UI refresh

## Project Layout

```
/app          Next.js App Router pages (Home, Budget)
/components   UI components (SummaryTile, ExpenseForm, BudgetCard, AppNavigation, …)
/lib          Server actions and data helpers (actions.ts, sqlite.ts)
/types        TypeScript interfaces (Expense, Category, Budget)
/data         Local SQLite data store
/wiki         Generated wiki pages (synced by wiki-sync.yml)
```
