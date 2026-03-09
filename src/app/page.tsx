import ExpenseDashboard from "@/components/ExpenseDashboard";
import { getBudget, getExpenses } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [expenses, budget] = await Promise.all([getExpenses(), getBudget()]);

  return (
    <main className="min-h-screen pb-6">
      <div className="rounded-2xl bg-slate-100 p-4 sm:p-6">
        <ExpenseDashboard expenses={expenses} budget={budget} />
      </div>
    </main>
  );
}
