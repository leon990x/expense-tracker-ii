"use client";

import { useActionState, useEffect, useOptimistic, useRef } from "react";
import { addExpense } from "@/lib/actions";
import { Category, Expense } from "@/types/expense";

const categories: Category[] = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Other",
];

interface ExpenseFormProps {
  onClose: () => void;
  onOptimisticAdd: (expense: Expense) => void;
}

interface FormState {
  success: boolean;
  error: string | null;
}

const initialState: FormState = {
  success: false,
  error: null,
};

const isCategory = (value: string): value is Category => {
  return categories.includes(value as Category);
};

const ExpenseForm = ({ onClose, onOptimisticAdd }: ExpenseFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const [, addOptimisticExpense] = useOptimistic<Expense[], Expense>(
    [],
    (state, expense) => [...state, expense],
  );

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      const amountValue = Number(formData.get("amount"));
      const categoryValue = String(formData.get("category"));
      const dateValue = String(formData.get("date"));
      const descriptionValue = String(formData.get("description") ?? "").trim();

      if (!Number.isFinite(amountValue) || amountValue <= 0) {
        return { success: false, error: "Please enter a valid amount." };
      }

      if (!isCategory(categoryValue)) {
        return { success: false, error: "Please select a valid category." };
      }

      if (!dateValue) {
        return { success: false, error: "Please select a date." };
      }

      const isoDate = new Date(`${dateValue}T12:00:00`).toISOString();

      await addExpense({
        amount: amountValue,
        category: categoryValue,
        date: isoDate,
        description: descriptionValue,
      });

      return { success: true, error: null };
    },
    initialState,
  );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    formRef.current?.reset();
    onClose();
  }, [state.success, onClose]);

  const handleSubmit = async (formData: FormData) => {
    const amountValue = Number(formData.get("amount"));
    const categoryValue = String(formData.get("category"));
    const dateValue = String(formData.get("date"));
    const descriptionValue = String(formData.get("description") ?? "").trim();

    if (
      Number.isFinite(amountValue) &&
      amountValue > 0 &&
      isCategory(categoryValue) &&
      dateValue
    ) {
      const optimisticExpense: Expense = {
        id: `optimistic-${Date.now()}`,
        amount: amountValue,
        category: categoryValue,
        date: new Date(`${dateValue}T12:00:00`).toISOString(),
        description: descriptionValue,
      };

      addOptimisticExpense(optimisticExpense);
      onOptimisticAdd(optimisticExpense);
    }

    await formAction(formData);
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Amount
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Category
          <select
            name="category"
            required
            defaultValue="Food"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Date
          <input
            name="date"
            type="date"
            required
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700 sm:col-span-2">
          Description
          <input
            name="description"
            type="text"
            placeholder="Optional note"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring"
          />
        </label>
      </div>

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
        >
          {isPending ? "Saving..." : "Save Expense"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
