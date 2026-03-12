import path from "path";
import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";
import { BudgetData, BudgetLimits, BudgetTimeframe } from "@/types/budget";
import { Category } from "@/types/expense";

const dbFilePath = path.join(process.cwd(), "data/expense-tracker.sqlite");

const allCategories: Category[] = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Merchandise",
  "Investments",
  "Subscriptions",
  "Coffee",
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
      await ensureAllBudgetRows(db);

      return db;
    })();
  }

  return dbPromise;
};

export { allCategories, allTimeframes, defaultBudgetData };
