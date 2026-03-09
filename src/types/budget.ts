import { Category } from "@/types/expense";

export type BudgetTimeframe = "daily" | "weekly" | "monthly";

export type BudgetLimits = Record<Category, number>;

export interface BudgetData {
  daily: BudgetLimits;
  weekly: BudgetLimits;
  monthly: BudgetLimits;
}

export interface BudgetCategoryRow {
  category: Category;
  spent: number;
  limit: number;
}
