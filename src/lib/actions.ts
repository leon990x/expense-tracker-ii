'use server';

import { randomUUID } from 'crypto';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { BudgetData, BudgetTimeframe } from '@/types/budget';
import { getDb, defaultBudgetData } from '@/lib/sqlite';
import { Category, Expense } from '@/types/expense';

export const getExpenses = async (): Promise<Expense[]> => {
  noStore();
  const db = await getDb();
  const rows = await db.all<Expense[]>(
    `SELECT id, amount, category, date, description
     FROM expenses
     ORDER BY datetime(date) DESC`,
  );

  return rows;
};

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<void> => {
  const db = await getDb();
  const newExpense: Expense = {
    ...expense,
    id: randomUUID(),
  };

  await db.run(
    `INSERT INTO expenses (id, amount, category, date, description)
     VALUES (?, ?, ?, ?, ?)`,
    newExpense.id,
    newExpense.amount,
    newExpense.category,
    newExpense.date,
    newExpense.description,
  );

  revalidatePath('/');
  revalidatePath('/budget');
};

export const editExpense = async (
  id: string,
  updates: Omit<Expense, 'id'>
): Promise<void> => {
  const db = await getDb();

  await db.run(
    `UPDATE expenses
     SET amount = ?, category = ?, date = ?, description = ?
     WHERE id = ?`,
    updates.amount,
    updates.category,
    updates.date,
    updates.description,
    id,
  );

  revalidatePath('/');
  revalidatePath('/budget');
};

export const deleteExpense = async (id: string): Promise<void> => {
  const db = await getDb();

  await db.run(`DELETE FROM expenses WHERE id = ?`, id);

  revalidatePath('/');
  revalidatePath('/budget');
};

export const getBudget = async (): Promise<BudgetData> => {
  noStore();
  const db = await getDb();
  const rows = await db.all<
    Array<{
      timeframe: BudgetTimeframe;
      category: Category;
      limitValue: number;
    }>
  >(`SELECT timeframe, category, limit_amount as limitValue FROM budget_limits`);

  const budget: BudgetData = {
    daily: { ...defaultBudgetData.daily },
    weekly: { ...defaultBudgetData.weekly },
    monthly: { ...defaultBudgetData.monthly },
  };

  for (const row of rows) {
    budget[row.timeframe][row.category] = row.limitValue;
  }

  return budget;
};

export const updateBudgetLimit = async (
  timeframe: BudgetTimeframe,
  category: Category,
  limit: number,
): Promise<void> => {
  const db = await getDb();
  const sanitizedLimit =
    limit === -1 ? -1 : Number.isFinite(limit) && limit >= 0 ? limit : 0;

  await db.run(
    `INSERT INTO budget_limits (timeframe, category, limit_amount)
     VALUES (?, ?, ?)
     ON CONFLICT(timeframe, category)
     DO UPDATE SET limit_amount = excluded.limit_amount`,
    timeframe,
    category,
    sanitizedLimit,
  );

  revalidatePath('/');
  revalidatePath('/budget');
};
