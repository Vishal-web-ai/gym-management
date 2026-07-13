import { requireAdminPage } from "@/lib/auth";
import ExpenseShell from "./ExpenseShell";
import ExportExpensesButton from "./ExportExpensesButton";

export default async function ExpensesPage() {
  await requireAdminPage();

  return (
    <div className="expenses-page space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Expenses
        </h1>
        <ExportExpensesButton />
      </div>

      <ExpenseShell />
    </div>
  );
}
