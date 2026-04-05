"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ExpenseForm from "@/components/ExpenseForm";
import SummaryTile from "@/components/SummaryTile";
import { deleteExpense, editExpense } from "@/lib/actions";
import { BudgetData, BudgetLimits } from "@/types/budget";
import { Category, Expense } from "@/types/expense";

type TileId = "today" | "week" | "month";

interface ExpenseDashboardProps {
  expenses: Expense[];
  budget: BudgetData;
}

type BudgetStatus = "normal" | "warning" | "danger";

const categoryOrder: Category[] = [
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

const getTotal = (items: Expense[]): number => {
  return items.reduce((sum, expense) => sum + expense.amount, 0);
};

const getBudgetStatus = (
  timeframeExpenses: Expense[],
  limits: BudgetLimits,
): BudgetStatus => {
  let hasWarning = false;

  for (const category of categoryOrder) {
    const spent = timeframeExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const limit = limits[category] ?? 0;

    if (limit < 0) {
      continue;
    }

    if (limit <= 0) {
      if (spent > 0) {
        return "danger";
      }
      continue;
    }

    if (spent > limit) {
      return "danger";
    }

    if (spent / limit >= 0.8) {
      hasWarning = true;
    }
  }

  return hasWarning ? "warning" : "normal";
};

// Expense Dashboard v2
const ExpenseDashboard = ({ expenses, budget }: ExpenseDashboardProps) => {
  const router = useRouter();
  const [expandedTiles, setExpandedTiles] = useState<Set<TileId>>(
    new Set(["today"]),
  );
  const [showForm, setShowForm] = useState(false);
  const [allExpenses, setAllExpenses] = useState<Expense[]>(expenses);

  const toggleTile = (tileId: TileId) => {
    setExpandedTiles((current) => {
      const next = new Set(current);

      if (next.has(tileId)) {
        next.delete(tileId);
      } else {
        next.add(tileId);
      }

      return next;
    });
  };

  const now = useMemo(() => new Date(), []);
  const { start: weekStart, end: weekEnd } = useMemo(
    () => getWeekRange(now),
    [now],
  );

  const dailyExpenses = useMemo(
    () =>
      allExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return isSameDay(expenseDate, now);
      }),
    [allExpenses, now],
  );

  const weeklyExpenses = useMemo(
    () =>
      allExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date);

        return isDateInRange(expenseDate, weekStart, weekEnd);
      }),
    [allExpenses, weekStart, weekEnd],
  );

  const monthlyExpenses = useMemo(
    () =>
      allExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date);

        return isSameMonth(expenseDate, now);
      }),
    [allExpenses, now],
  );

  const dailyBudgetStatus = useMemo(
    () => getBudgetStatus(dailyExpenses, budget.daily),
    [dailyExpenses, budget.daily],
  );

  const weeklyBudgetStatus = useMemo(
    () => getBudgetStatus(weeklyExpenses, budget.weekly),
    [weeklyExpenses, budget.weekly],
  );

  const monthlyBudgetStatus = useMemo(
    () => getBudgetStatus(monthlyExpenses, budget.monthly),
    [monthlyExpenses, budget.monthly],
  );

  const handleDeleteExpense = async (expenseId: string) => {
    const previousExpenses = allExpenses;
    setAllExpenses((current) =>
      current.filter((expense) => expense.id !== expenseId),
    );

    try {
      await deleteExpense(expenseId);
      router.refresh();
    } catch {
      setAllExpenses(previousExpenses);
    }
  };

  const handleEditExpense = async (
    expense: Expense,
    updates: Partial<
      Pick<Expense, "amount" | "description" | "category" | "date">
    >,
  ) => {
    const previousExpenses = allExpenses;
    const updatedExpense: Expense = {
      ...expense,
      amount: updates.amount ?? expense.amount,
      description: updates.description ?? expense.description,
      category: updates.category ?? expense.category,
      date: updates.date ?? expense.date,
    };

    setAllExpenses((current) =>
      current.map((item) => (item.id === expense.id ? updatedExpense : item)),
    );

    try {
      await editExpense(expense.id, {
        amount: updatedExpense.amount,
        category: updatedExpense.category,
        date: updatedExpense.date,
        description: updatedExpense.description,
      });
      router.refresh();
    } catch {
      setAllExpenses(previousExpenses);
    }
  };

  const handleBulkEditCategory = async (
    expenseIds: string[],
    newCategory: Expense["category"],
  ) => {
    if (expenseIds.length === 0) {
      return;
    }

    const previousExpenses = allExpenses;
    const expenseIdSet = new Set(expenseIds);

    setAllExpenses((current) =>
      current.map((expense) =>
        expenseIdSet.has(expense.id)
          ? { ...expense, category: newCategory }
          : expense,
      ),
    );

    try {
      await Promise.all(
        previousExpenses
          .filter((expense) => expenseIdSet.has(expense.id))
          .map((expense) =>
            editExpense(expense.id, {
              amount: expense.amount,
              category: newCategory,
              date: expense.date,
              description: expense.description,
            }),
          ),
      );
      router.refresh();
    } catch {
      setAllExpenses(previousExpenses);
    }
  };

  return (
    <>
      <section className="grid items-start gap-5 md:grid-cols-2">
        <SummaryTile
          id="today"
          title="Today"
          amount={getTotal(dailyExpenses)}
          expenses={dailyExpenses}
          amountStatus={dailyBudgetStatus}
          isExpanded={expandedTiles.has("today")}
          onToggle={(id) => {
            const tileId = id as TileId;
            toggleTile(tileId);
          }}
          onDeleteExpense={handleDeleteExpense}
          onEditExpense={handleEditExpense}
          onBulkEditCategory={handleBulkEditCategory}
        />

        <div className="flex flex-col gap-5">
          <SummaryTile
            id="week"
            title="This Week"
            amount={getTotal(weeklyExpenses)}
            expenses={weeklyExpenses}
            amountStatus={weeklyBudgetStatus}
            isExpanded={expandedTiles.has("week")}
            onToggle={(id) => {
              const tileId = id as TileId;
              toggleTile(tileId);
            }}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleEditExpense}
            onBulkEditCategory={handleBulkEditCategory}
          />

          <SummaryTile
            id="month"
            title="This Month"
            amount={getTotal(monthlyExpenses)}
            expenses={monthlyExpenses}
            amountStatus={monthlyBudgetStatus}
            isExpanded={expandedTiles.has("month")}
            onToggle={(id) => {
              const tileId = id as TileId;
              toggleTile(tileId);
            }}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleEditExpense}
            onBulkEditCategory={handleBulkEditCategory}
          />
        </div>
      </section>

      <div className="mt-8 flex flex-col items-center">
        <div
          className={`grid w-full max-w-2xl transition-all duration-300 ease-out ${
            showForm
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden rounded-xl bg-white/80">
            {showForm ? (
              <ExpenseForm
                onClose={() => setShowForm(false)}
                onOptimisticAdd={(optimisticExpense) => {
                  setAllExpenses((current) => [optimisticExpense, ...current]);
                }}
              />
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="mt-4 w-full max-w-md rounded-xl bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          {showForm ? "Close Expense Form" : "Add Expense"}
        </button>
      </div>
    </>
  );
};

export default ExpenseDashboard;
