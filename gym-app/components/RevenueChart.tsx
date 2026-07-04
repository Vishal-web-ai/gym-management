"use client";

type MonthData = {
  label: string;
  revenue: number;
  expenses: number;
};

export default function RevenueChart({ data }: { data: MonthData[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 1);

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="mb-4 text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
        Revenue vs Expenses (12 Months)
      </h3>
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex items-end gap-1.5" style={{ height: 160, minWidth: 440 }}>
          {data.map((m) => {
            const revH = (m.revenue / maxVal) * 130;
            const expH = (m.expenses / maxVal) * 130;
            return (
              <div key={m.label} className="flex flex-1 flex-col items-center justify-end gap-0.5 min-w-[30px]">
                <div className="w-full flex flex-col items-center" style={{ height: 130, justifyContent: "flex-end" }}>
                  <div
                    style={{ height: Math.max(revH, 2) }}
                    className="w-full rounded-t-sm bg-emerald-500/60 transition-all"
                    title={`Revenue: ₹${m.revenue.toLocaleString("en-IN")}`}
                  />
                  <div
                    style={{ height: Math.max(expH, 2) }}
                    className="w-full rounded-t-sm bg-red-500/60 transition-all"
                    title={`Expenses: ₹${m.expenses.toLocaleString("en-IN")}`}
                  />
                </div>
                <span className="text-[10px] text-text-muted mt-1 truncate w-full text-center">
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-emerald-500/60" /> Revenue
          </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-red-500/60" /> Expenses
        </span>
      </div>
    </div>
  );
}
