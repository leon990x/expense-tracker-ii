'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { BudgetData, BudgetLimits, BudgetTimeframe } from '@/types/budget';
import { Category, Expense } from '@/types/expense';

const dataPath = path.join(process.cwd(), 'data/expenses.json');
const budgetPath = path.join(process.cwd(), 'data/budget.json');

const allCategories: Category[] = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Merchandise',
  'Other',
];

const createEmptyBudgetLimits = (): BudgetLimits => {
  return allCategories.reduce<BudgetLimits>((accumulator, category) => {
    accumulator[category] = 0;
    return accumulator;
  }, {} as BudgetLimits);
};

const defaultBudgetData: BudgetData = {
  daily: createEmptyBudgetLimits(),
  weekly: createEmptyBudgetLimits(),
  monthly: createEmptyBudgetLimits(),
};

const readExpensesFile = async (): Promise<Expense[]> => {
  const file = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(file) as Expense[];
};

const writeExpensesFile = async (expenses: Expense[]): Promise<void> => {
  await fs.writeFile(dataPath, JSON.stringify(expenses, null, 2));
};

const readBudgetFile = async (): Promise<BudgetData> => {
  try {
    const file = await fs.readFile(budgetPath, 'utf8');
    const parsed = JSON.parse(file) as Partial<BudgetData>;

    return {
      daily: { ...defaultBudgetData.daily, ...(parsed.daily ?? {}) },
      weekly: { ...defaultBudgetData.weekly, ...(parsed.weekly ?? {}) },
      monthly: { ...defaultBudgetData.monthly, ...(parsed.monthly ?? {}) },
    };
  } catch {
    return defaultBudgetData;
  }
};

const writeBudgetFile = async (budget: BudgetData): Promise<void> => {
  await fs.writeFile(budgetPath, JSON.stringify(budget, null, 2));
};

export const getExpenses = async (): Promise<Expense[]> => {
  return readExpensesFile();
};

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<void> => {
  const expenses = await readExpensesFile();

  const newExpense: Expense = {
    ...expense,
    id: Math.random().toString(36).substring(2, 9),
  };

  await writeExpensesFile([...expenses, newExpense]);
  revalidatePath('/');
};

export const editExpense = async (
  id: string,
  updates: Omit<Expense, 'id'>
): Promise<void> => {
  const expenses = await readExpensesFile();

  const updatedExpenses = expenses.map((expense) =>
    expense.id === id ? { ...expense, ...updates } : expense
  );

  await writeExpensesFile(updatedExpenses);
  revalidatePath('/');
};

export const deleteExpense = async (id: string): Promise<void> => {
  const expenses = await readExpensesFile();
  const filteredExpenses = expenses.filter((expense) => expense.id !== id);

  await writeExpensesFile(filteredExpenses);
  revalidatePath('/');
};

export const getBudget = async (): Promise<BudgetData> => {
  return readBudgetFile();
};

export const updateBudgetLimit = async (
  timeframe: BudgetTimeframe,
  category: Category,
  limit: number,
): Promise<void> => {
  const budget = await readBudgetFile();
  const sanitizedLimit = Number.isFinite(limit) && limit >= 0 ? limit : 0;

  const updatedBudget: BudgetData = {
    ...budget,
    [timeframe]: {
      ...budget[timeframe],
      [category]: sanitizedLimit,
    },
  };

  await writeBudgetFile(updatedBudget);
  revalidatePath('/');
  revalidatePath('/budget');
};
