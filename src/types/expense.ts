export type Category =
  | "Food"
  | "Transport"
  | "Housing"
  | "Entertainment"
  | "Utilities"
  | "Healthcare"
  | "Merchandise"
  | "Other";

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO String
  description: string;
}

export interface DailySummary {
  total: number;
  categories: Record<Category, number>;
}
