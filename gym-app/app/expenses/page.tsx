import { requireAdminPage } from "@/lib/auth";
import ExpenseShell from "./ExpenseShell";

export default async function ExpensesPage() {
  await requireAdminPage();

  return (
    <div className="expenses-page space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Expenses
        </h1>
      </div>

      <ExpenseShell />
    </div>
  );
}
