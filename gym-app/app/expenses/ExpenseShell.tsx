"use client";

import { useQuery } from "@tanstack/react-query";
import { getExpenses } from "@/lib/actions/expenses";
import ExpenseClient from "./ExpenseClient";

export default function ExpenseShell() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  return <ExpenseClient initial={data} />;
}
