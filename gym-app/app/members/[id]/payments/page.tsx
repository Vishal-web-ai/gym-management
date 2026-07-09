import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { getMemberById, getPaymentsByMemberId } from "@/lib/actions/members";
import { getGymConfig } from "@/lib/actions/settings";
import { getPlans } from "@/lib/actions/plans";
import PaymentsClient from "./PaymentsClient";

type ApiMember = {
  id: string;
  firstName: string;
  phone: string;
  status: string;
  endDate: Date | null;
  createdAt: Date;
  image?: string | null;
};

type ApiPayment = {
  id: string;
  memberId: string;
  amount: number;
  mode: string;
  status: string;
  createdAt: Date;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
};

export default async function MemberPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdminPage();
  const { id } = await params;
  const userId = user.gymOwnerId;
  let member: ApiMember | null = null;
  let payments: ApiPayment[] = [];
  let plans: Plan[] = [];
  let gymName: string | undefined;
  try {
    [member, payments, plans, gymName] = await Promise.all([
      getMemberById(id),
      getPaymentsByMemberId(id),
      getPlans(userId),
      getGymConfig(userId).then((c) => c?.gymName ?? undefined),
    ]);
  } catch {
    // Database not configured yet
  }

  if (!member) notFound();

  return (
    <div className="space-y-0 px-3 pb-4 pt-0 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          href={`/members/${id}`}
          className="flex size-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="rounded-[20px] border border-border bg-bg-surface p-[18px] animate-slide-up delay-1">
        <h2 className="text-center text-lg font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          {member.firstName}
        </h2>
      </div>

      <PaymentsClient
        memberId={id}
        member={member}
        payments={payments}
        plans={plans}
        gymUserId={userId}
        gymName={gymName}
      />
    </div>
  );
}
