"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Pencil, Trash2, X } from "lucide-react";
import { Category, Expense } from "@/types/expense";

interface SummaryTileProps {
  id: string;
  title: string;
  amount: number;
  amountStatus: "normal" | "warning" | "danger";
  expenses: Expense[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onEditExpense: (
    expense: Expense,
    updates: Partial<
      Pick<Expense, "amount" | "description" | "category" | "date">
    >,
  ) => Promise<void>;
  onBulkEditCategory: (
    expenseIds: string[],
    newCategory: Category,
  ) => Promise<void>;
}

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

const SummaryTile = ({
  id,
  title,
  amount,
  amountStatus,
  expenses,
  isExpanded,
  onToggle,
  onDeleteExpense,
  onEditExpense,
  onBulkEditCategory,
}: SummaryTileProps) => {
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [draftAmount, setDraftAmount] = useState<string>("");
  const [draftDescription, setDraftDescription] = useState<string>("");
  const [draftDate, setDraftDate] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draftCategory, setDraftCategory] = useState<Category>("Food");

  const toDateInputValue = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const startEditingAmount = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setDraftAmount(expense.amount.toFixed(2));
    setDraftDescription(expense.description);
    setDraftDate(toDateInputValue(expense.date));
  };

  const cancelEditingAmount = () => {
    setEditingExpenseId(null);
    setDraftAmount("");
    setDraftDescription("");
    setDraftDate("");
  };

  const saveEditedAmount = async (expense: Expense) => {
    const parsedAmount = Number(draftAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const nextDate = draftDate
      ? new Date(`${draftDate}T12:00:00`).toISOString()
      : expense.date;

    await onEditExpense(expense, {
      amount: parsedAmount,
      description: draftDescription.trim(),
      date: nextDate,
    });
    cancelEditingAmount();
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category);
    setDraftCategory(category);
  };

  const cancelEditingCategory = () => {
    setEditingCategory(null);
  };

  const saveEditedCategory = async (expenseIds: string[]) => {
    if (expenseIds.length === 0 || !editingCategory) {
      return;
    }

    await onBulkEditCategory(expenseIds, draftCategory);
    setEditingCategory(null);
  };

  const formatExpenseDate = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--/--";
    }

    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  const groupedExpenses = useMemo(() => {
    return categoryOrder.reduce<Record<Category, Expense[]>>(
      (accumulator, category) => {
        accumulator[category] = expenses.filter(
          (expense) => expense.category === category,
        );
        return accumulator;
      },
      {
        Food: [],
        Transport: [],
        Housing: [],
        Entertainment: [],
        Utilities: [],
        Healthcare: [],
        Merchandise: [],
        Investments: [],
        Subscriptions: [],
        Coffee: [],
        Other: [],
      },
    );
  }, [expenses]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${
              amountStatus === "danger"
                ? "text-rose-500"
                : amountStatus === "warning"
                  ? "text-orange-500"
                  : "text-[#0072C1]"
            }`}
          >
            ${amount.toFixed(2)}
          </p>
        </div>
        <span className="text-xl text-slate-500 transition-transform duration-300">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isExpanded
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {expenses.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Category breakdown
              </p>
              <div className="space-y-3">
                {categoryOrder.map((category) => {
                  const expensesInCategory = groupedExpenses[category];
                  const categoryTotal = expensesInCategory.reduce(
                    (sum, expense) => sum + expense.amount,
                    0,
                  );
                  const showCategoryEditTrigger =
                    editingExpenseId !== null &&
                    expensesInCategory.some(
                      (expense) => expense.id === editingExpenseId,
                    );

                  if (expensesInCategory.length === 0) {
                    return null;
                  }

                  return (
                    <div key={category} className="rounded-md bg-white p-3">
                      <div className="mb-2 flex items-center justify-between">
                        {editingCategory === category ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={draftCategory}
                              onChange={(event) =>
                                setDraftCategory(event.target.value as Category)
                              }
                              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                            >
                              {categoryOrder.map((categoryOption) => (
                                <option
                                  key={categoryOption}
                                  value={categoryOption}
                                >
                                  {categoryOption}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-800">
                            <span>{category}</span>
                            {showCategoryEditTrigger ? (
                              <button
                                type="button"
                                onClick={() => startEditingCategory(category)}
                                className="rounded p-0.5 text-slate-500 transition hover:bg-slate-100 hover:text-sky-700"
                                aria-label="Edit category"
                              >
                                <ChevronDown size={12} />
                              </button>
                            ) : null}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-slate-700">
                          ${categoryTotal.toFixed(2)}
                        </p>
                      </div>

                      <ul className="space-y-1">
                        {expensesInCategory.map((expense) => (
                          <li
                            key={expense.id}
                            className="min-h-16 rounded-md border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-xs text-slate-600"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                {editingExpenseId === expense.id ? (
                                  <input
                                    type="text"
                                    value={draftDescription}
                                    onChange={(event) =>
                                      setDraftDescription(event.target.value)
                                    }
                                    className="h-5 w-full rounded border border-sky-600 bg-white px-1 text-sm text-slate-700 outline-none focus:ring-0"
                                  />
                                ) : (
                                  <p className="truncate text-sm text-slate-700">
                                    {expense.description || "No description"}
                                  </p>
                                )}
                                {editingExpenseId === expense.id ? (
                                  <input
                                    type="date"
                                    value={draftDate}
                                    onChange={(event) =>
                                      setDraftDate(event.target.value)
                                    }
                                    className="mt-0.5 h-5 w-full rounded border border-sky-600 bg-white px-1 text-xs text-slate-700 outline-none focus:ring-0"
                                  />
                                ) : (
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {formatExpenseDate(expense.date)}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {editingExpenseId === expense.id ? (
                                  <>
                                    <input
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      value={draftAmount}
                                      onChange={(event) =>
                                        setDraftAmount(event.target.value)
                                      }
                                      className="h-5 w-20 rounded border border-sky-600 bg-white px-1 text-right text-sm text-slate-700 outline-none focus:ring-0"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        void saveEditedAmount(expense);
                                      }}
                                      className="rounded p-1 text-emerald-600 transition hover:bg-emerald-50"
                                      aria-label="Save amount"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditingAmount}
                                      className="rounded p-1 text-slate-500 transition hover:bg-slate-200"
                                      aria-label="Cancel edit"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span className="min-w-20 text-right text-sm font-semibold text-slate-700">
                                      ${expense.amount.toFixed(2)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        startEditingAmount(expense);
                                      }}
                                      className="rounded p-1.5 text-sky-600 transition hover:bg-sky-50"
                                      aria-label="Edit expense amount"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void onDeleteExpense(expense.id)
                                      }
                                      className="rounded p-1.5 text-rose-500 transition hover:bg-rose-50"
                                      aria-label="Delete expense"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">No expenses today.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SummaryTile;
