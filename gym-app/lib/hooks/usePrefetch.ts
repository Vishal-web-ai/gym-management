"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getMembersPaginated } from "@/lib/actions/members";
import { getAllPayments } from "@/lib/actions/payments";
import { getCheckInsByDate } from "@/lib/actions/attendance";
import { useCallback } from "react";

export function usePrefetch() {
  const queryClient = useQueryClient();

  return useCallback((href: string) => {
    const now = new Date();
    switch (href) {
      case "/members":
        queryClient.prefetchQuery({
          queryKey: ["members"],
          queryFn: () => getMembersPaginated(0, 20),
          staleTime: 5 * 60 * 1000,
        });
        break;
      case "/payments":
        queryClient.prefetchQuery({
          queryKey: ["payments", 1, now.getMonth(), now.getFullYear()],
          queryFn: () => getAllPayments(1, now.getMonth(), now.getFullYear()),
          staleTime: 30 * 1000,
        });
        break;
      case "/attendance": {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        queryClient.prefetchQuery({
          queryKey: ["checkins", `${y}-${m}-${d}`],
          queryFn: () => getCheckInsByDate(`${y}-${m}-${d}`),
          staleTime: 15 * 1000,
        });
        break;
      }
    }
  }, [queryClient]);
}
