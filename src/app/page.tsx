import ExpenseDashboard from "@/components/ExpenseDashboard";
import { getExpenses } from "@/lib/actions";

export default async function Home() {
  const expenses = await getExpenses();

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

        <ExpenseDashboard expenses={expenses} />
      </div>
    </main>
  );
}
