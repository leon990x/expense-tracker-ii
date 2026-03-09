"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateBudgetLimit } from "@/lib/actions";
import { BudgetCategoryRow, BudgetTimeframe } from "@/types/budget";
import { Category } from "@/types/expense";

interface BudgetCardProps {
  id: "today" | "week" | "month";
  title: string;
  timeframe: BudgetTimeframe;
  rows: BudgetCategoryRow[];
  isExpanded: boolean;
  onToggle: (id: "today" | "week" | "month") => void;
}

const BudgetCard = ({
  id,
  title,
  timeframe,
  rows,
  isExpanded,
  onToggle,
}: BudgetCardProps) => {
  const [localRows, setLocalRows] = useState<BudgetCategoryRow[]>(rows);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draftLimit, setDraftLimit] = useState<string>("");

  const startEdit = (row: BudgetCategoryRow) => {
    setEditingCategory(row.category);
    setDraftLimit(row.limit.toFixed(2));
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setDraftLimit("");
  };

  const saveLimit = async (row: BudgetCategoryRow) => {
    const parsedLimit = Number(draftLimit);

    if (!Number.isFinite(parsedLimit) || parsedLimit < 0) {
      return;
    }

    const previousRows = localRows;
    setLocalRows((current) =>
      current.map((item) =>
        item.category === row.category ? { ...item, limit: parsedLimit } : item,
      ),
    );

    try {
      await updateBudgetLimit(timeframe, row.category, parsedLimit);
      cancelEdit();
    } catch {
      setLocalRows(previousRows);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between text-left"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
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
              Budget by category
            </p>

            <ul className="space-y-3">
              {localRows.map((row) => {
                const ratio =
                  row.limit > 0 ? row.spent / row.limit : row.spent > 0 ? 1 : 0;
                const progressPercent = Math.min(100, Math.max(0, ratio * 100));
                const isOverBudget =
                  row.limit > 0 ? row.spent > row.limit : row.spent > 0;
                const isNearLimit = !isOverBudget && ratio >= 0.8;
                const progressBarClassName = isOverBudget
                  ? "bg-rose-500"
                  : isNearLimit
                    ? "bg-orange-500"
                    : "bg-[#0072C1]";

                return (
                  <li
                    key={row.category}
                    className="rounded-md border border-slate-100 bg-white p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {row.category}
                        </p>
                        <p className="text-xs text-slate-600">
                          Spent: ${row.spent.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {editingCategory === row.category ? (
                          <>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={draftLimit}
                              onChange={(event) =>
                                setDraftLimit(event.target.value)
                              }
                              className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-right text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => void saveLimit(row)}
                              className="rounded bg-[#0072C1] px-2 py-1 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-slate-700">
                              Limit: ${row.limit.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => startEdit(row)}
                              className="rounded p-1 text-sky-600 transition hover:bg-sky-50"
                              aria-label={`Edit ${row.category} limit`}
                            >
                              <Pencil size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full transition-all duration-300 ${progressBarClassName}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetCard;
