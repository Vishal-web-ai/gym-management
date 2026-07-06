import { getExpenses } from "@/lib/actions/expenses";
import { exportExpensesCSV } from "@/lib/actions/members";
import ExpenseClient from "./ExpenseClient";
import { requireAdminPage } from "@/lib/auth";

export default async function ExpensesPage() {
  await requireAdminPage();

  let expenses: any[] = [];
  let expensesError: string | null = null;
  let expensesCsv = "";
  try {
    [expenses, expensesCsv] = await Promise.all([
      getExpenses(),
      exportExpensesCSV().catch(() => ""),
    ]);
  } catch (e) {
    expensesError = e instanceof Error ? e.message : "Failed to load expenses";
  }

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Expenses
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">
            {expenses.length} total
          </p>
        </div>
      </div>

      {expensesError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          {expensesError}
        </div>
      )}

      <ExpenseClient initial={expenses} csvData={expensesCsv} />
    </div>
  );
}
