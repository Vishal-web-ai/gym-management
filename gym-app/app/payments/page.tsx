import { getAllPayments } from "@/lib/actions/payments";
import { getGymConfig } from "@/lib/actions/settings";
import PaymentsClient from "./PaymentsClient";
import { requireAdminPage } from "@/lib/auth";
import { getNow } from "@/lib/now";

export default async function PaymentsPage() {
  await requireAdminPage();
  const now = await getNow();
  const [config, { payments, total, hasMore, totalAmount }] = await Promise.all([
    getGymConfig(),
    getAllPayments(1, now.getMonth(), now.getFullYear()),
  ]);
  return (
    <PaymentsClient
      initialPayments={payments}
      initialTotal={total}
      initialHasMore={hasMore ?? false}
      initialTotalAmount={totalAmount}
      gymName={config?.gymName ?? undefined}
    />
  );
}
