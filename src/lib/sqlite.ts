import { promises as fs } from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";
import { BudgetData, BudgetLimits, BudgetTimeframe } from "@/types/budget";
import { Category, Expense } from "@/types/expense";

const dbFilePath = path.join(process.cwd(), "data/expense-tracker.sqlite");
const expensesJsonPath = path.join(process.cwd(), "data/expenses.json");
const budgetJsonPath = path.join(process.cwd(), "data/budget.json");

const allCategories: Category[] = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Merchandise",
  "Other",
];

const allTimeframes: BudgetTimeframe[] = ["daily", "weekly", "monthly"];

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

let dbPromise: Promise<Database> | null = null;

const readJsonFile = async <T>(filePath: string): Promise<T | null> => {
  try {
    const file = await fs.readFile(filePath, "utf8");
    return JSON.parse(file) as T;
  } catch {
    return null;
  }
};

const initializeSchema = async (db: Database): Promise<void> => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budget_limits (
      timeframe TEXT NOT NULL,
      category TEXT NOT NULL,
      limit_amount REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (timeframe, category)
    );
  `);
};

const migrateExpensesFromJson = async (db: Database): Promise<void> => {
  const countRow = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM expenses",
  );

  if ((countRow?.count ?? 0) > 0) {
    return;
  }

  const expenses = await readJsonFile<Expense[]>(expensesJsonPath);

  if (!expenses || expenses.length === 0) {
    return;
  }

  await db.exec("BEGIN TRANSACTION");
  try {
    for (const expense of expenses) {
      await db.run(
        `INSERT INTO expenses (id, amount, category, date, description)
         VALUES (?, ?, ?, ?, ?)`,
        expense.id,
        expense.amount,
        expense.category,
        expense.date,
        expense.description ?? "",
      );
    }
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
};

const migrateBudgetFromJson = async (db: Database): Promise<void> => {
  const countRow = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM budget_limits",
  );

  if ((countRow?.count ?? 0) > 0) {
    return;
  }

  const budgetData = await readJsonFile<Partial<BudgetData>>(budgetJsonPath);
  const mergedBudget: BudgetData = {
    daily: { ...defaultBudgetData.daily, ...(budgetData?.daily ?? {}) },
    weekly: { ...defaultBudgetData.weekly, ...(budgetData?.weekly ?? {}) },
    monthly: { ...defaultBudgetData.monthly, ...(budgetData?.monthly ?? {}) },
  };

  await db.exec("BEGIN TRANSACTION");
  try {
    for (const timeframe of allTimeframes) {
      for (const category of allCategories) {
        await db.run(
          `INSERT INTO budget_limits (timeframe, category, limit_amount)
           VALUES (?, ?, ?)
           ON CONFLICT(timeframe, category) DO NOTHING`,
          timeframe,
          category,
          mergedBudget[timeframe][category] ?? 0,
        );
      }
    }
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
};

const ensureAllBudgetRows = async (db: Database): Promise<void> => {
  for (const timeframe of allTimeframes) {
    for (const category of allCategories) {
      await db.run(
        `INSERT INTO budget_limits (timeframe, category, limit_amount)
         VALUES (?, ?, 0)
         ON CONFLICT(timeframe, category) DO NOTHING`,
        timeframe,
        category,
      );
    }
  }
};

export const getDb = async (): Promise<Database> => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await open({
        filename: dbFilePath,
        driver: sqlite3.Database,
      });

      await initializeSchema(db);
      await migrateExpensesFromJson(db);
      await migrateBudgetFromJson(db);
      await ensureAllBudgetRows(db);

      return db;
    })();
  }

  return dbPromise;
};

export { allCategories, allTimeframes, defaultBudgetData };
