# ExpenseDashboard

## Purpose

Displays expandable and collapsible expense summaries for today, this week, and this month; supports inline add, edit, delete, and bulk category updates with optimistic UI.

## File

- `src/components/ExpenseDashboard.tsx`

## Props

- `expenses: Expense[]`
- `budget: BudgetData`

## Behavior

- Client component with local state for:
  - expanded summary tiles (`today`, `week`, `month`)
  - expense form visibility
  - optimistic expense list (`allExpenses`)
- Derives daily/weekly/monthly expense groups via date helpers.
- Computes totals and budget status (`normal`, `warning`, `danger`) per timeframe.
- Performs optimistic updates for delete/edit/bulk-category actions, then calls server actions and refreshes route.
- Reverts optimistic state if a mutation fails.

## Key Functions

- `getWeekRange`, `isSameDay`, `isDateInRange`, `isSameMonth`: timeframe filtering.
- `getTotal`: sums expense amounts.
- `getBudgetStatus`: compares category spending against configured limits.

## Rendered Structure

- Summary tiles:
  - `Today`
  - `This Week`
  - `This Month`
- Collapsible inline form area with `ExpenseForm`.
- Toggle button that switches between `Add Expense` and `Close Expense Form`.
