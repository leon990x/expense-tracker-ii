import BudgetDashboard from "@/components/BudgetDashboard";
import { getBudget, getExpenses } from "@/lib/actions";
import { BudgetCategoryRow } from "@/types/budget";
import { Category, Expense } from "@/types/expense";

export const dynamic = "force-dynamic";

const categoryOrder: Category[] = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Merchandise",
  "Other",
];

const isSameDay = (firstDate: Date, secondDate: Date): boolean => {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
};

const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  const dayIndex = date.getDay();
  const offset = dayIndex === 0 ? -6 : 1 - dayIndex;
  start.setDate(date.getDate() + offset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { start, end };
};

const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date < end;
};

const isSameMonth = (firstDate: Date, secondDate: Date): boolean => {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth()
  );
};

const buildRows = (
  expenses: Expense[],
  limits: Record<Category, number>,
): BudgetCategoryRow[] => {
  return categoryOrder.map((category) => {
    const spent = expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      category,
      spent,
      limit: limits[category] ?? 0,
    };
  });
};

const BudgetPage = async () => {
  const [expenses, budget] = await Promise.all([getExpenses(), getBudget()]);
  const now = new Date();
  const { start: weekStart, end: weekEnd } = getWeekRange(now);

  const dailyExpenses = expenses.filter((expense) =>
    isSameDay(new Date(expense.date), now),
  );
  const weeklyExpenses = expenses.filter((expense) =>
    isDateInRange(new Date(expense.date), weekStart, weekEnd),
  );
  const monthlyExpenses = expenses.filter((expense) =>
    isSameMonth(new Date(expense.date), now),
  );

  return (
    <main className="min-h-screen pb-6">
      <div className="rounded-2xl bg-slate-100 p-4 sm:p-6">
        <BudgetDashboard
          dailyRows={buildRows(dailyExpenses, budget.daily)}
          weeklyRows={buildRows(weeklyExpenses, budget.weekly)}
          monthlyRows={buildRows(monthlyExpenses, budget.monthly)}
        />
      </div>
    </main>
  );
};

export default BudgetPage;
