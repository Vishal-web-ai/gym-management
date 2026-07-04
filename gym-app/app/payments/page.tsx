import { getAllPayments } from "@/lib/actions/payments";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage() {
  const { payments, total, hasMore } = await getAllPayments(1);
  return <PaymentsClient initialPayments={payments} initialTotal={total} initialHasMore={hasMore ?? false} />;
}
