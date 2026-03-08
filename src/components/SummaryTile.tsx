"use client";

import { useMemo, useState } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import { Category, Expense } from "@/types/expense";

interface SummaryTileProps {
  title: string;
  expenses: Expense[];
}

const categoryOrder: Category[] = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Other",
];

const SummaryTile = ({ title, expenses }: SummaryTileProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(expenses);

  const total = useMemo(
    () => localExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [localExpenses],
  );

  const groupedExpenses = useMemo(() => {
    return categoryOrder.reduce<Record<Category, Expense[]>>(
      (accumulator, category) => {
        accumulator[category] = localExpenses.filter(
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
        Other: [],
      },
    );
  }, [localExpenses]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            ${total.toFixed(2)}
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

                if (expensesInCategory.length === 0) {
                  return null;
                }

                return (
                  <div key={category} className="rounded-md bg-white p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">
                        {category}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        ${categoryTotal.toFixed(2)}
                      </p>
                    </div>

                    <ul className="space-y-1">
                      {expensesInCategory.map((expense) => (
                        <li
                          key={expense.id}
                          className="flex items-center justify-between text-xs text-slate-600"
                        >
                          <span>{expense.description || "No description"}</span>
                          <span>${expense.amount.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              {showForm ? "Hide Form" : "Add Expense"}
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                showForm
                  ? "mt-2 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                {showForm ? (
                  <ExpenseForm
                    onClose={() => setShowForm(false)}
                    onOptimisticAdd={(optimisticExpense) => {
                      setLocalExpenses((current) => [
                        optimisticExpense,
                        ...current,
                      ]);
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummaryTile;
