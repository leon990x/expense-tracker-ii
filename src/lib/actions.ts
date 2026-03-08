'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Expense } from '@/types/expense';

const dataPath = path.join(process.cwd(), 'data/expenses.json');

const readExpensesFile = async (): Promise<Expense[]> => {
  const file = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(file) as Expense[];
};

const writeExpensesFile = async (expenses: Expense[]): Promise<void> => {
  await fs.writeFile(dataPath, JSON.stringify(expenses, null, 2));
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
