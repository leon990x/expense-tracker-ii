import SummaryTile from "@/components/SummaryTile";
import { getExpenses } from "@/lib/actions";
import { Expense } from "@/types/expense";

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

const filterExpenses = (
  expenses: Expense[],
  predicate: (expenseDate: Date) => boolean,
): Expense[] => {
  return expenses.filter((expense) => predicate(new Date(expense.date)));
};

export default async function Home() {
  const expenses = await getExpenses();
  const today = new Date();
  const { start: weekStart, end: weekEnd } = getWeekRange(today);

  const dailyExpenses = filterExpenses(expenses, (expenseDate) =>
    isSameDay(expenseDate, today),
  );

  const weeklyExpenses = filterExpenses(expenses, (expenseDate) =>
    isDateInRange(expenseDate, weekStart, weekEnd),
  );

  const monthlyExpenses = filterExpenses(expenses, (expenseDate) =>
    isSameMonth(expenseDate, today),
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            DollarVis
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track daily, weekly, and monthly expenses with inline updates.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SummaryTile title="Today" expenses={dailyExpenses} />
          <SummaryTile title="This Week" expenses={weeklyExpenses} />
          <SummaryTile title="This Month" expenses={monthlyExpenses} />
        </section>
      </div>
    </main>
  );
}
