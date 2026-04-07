# Actions

`src/lib/actions.ts` contains server actions for reading and mutating expenses and budget limits.

Major actions include `getExpenses`, `addExpense`, `editExpense`, `deleteExpense`, `getBudget`, and `updateBudgetLimit`. Mutations call `revalidatePath('/')` and `revalidatePath('/budget')` to keep both dashboards current.
