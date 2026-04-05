# Expense Form

`ExpenseForm` handles creating new expenses with amount, category, date, and description fields. It validates inputs client-side and submits through the `addExpense` server action.

The form also applies an optimistic add callback so new entries appear immediately in the dashboard before server revalidation completes.
