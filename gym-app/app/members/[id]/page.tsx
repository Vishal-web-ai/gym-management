import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, Phone, Calendar, MapPin, VenusAndMars, History } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { getNow } from "@/lib/now";
import {
  getMemberById,
  getPaymentsByMemberId,
} from "@/lib/actions/members";
import { getGymConfig } from "@/lib/actions/settings";
import { getPlans } from "@/lib/actions/plans";
import MemberDetailClient from "./MemberDetailClient";
import MemberQuickActions from "./MemberQuickActions";
import ProfilePhoto from "@/components/ProfilePhoto";

type MemberDetail = {
  id: string;
  firstName: string;
  phone: string;
  address?: string | null;
  gender?: string | null;
  status: string;
  endDate: Date | null;
  createdAt: Date;
  image?: string | null;
  plan?: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  } | null;
};

type MemberPayment = {
  id: string;
  memberId: string;
  amount: number;
  mode: string;
  status: string;
  createdAt: Date;
};

type MemberPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdminPage();
  const now = await getNow();
  const { id } = await params;
  const userId = user.gymOwnerId;
  let member: MemberDetail | null = null;
  let payments: MemberPayment[] = [];
  let plans: MemberPlan[] = [];
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

  const memberName = member.firstName;
  const latestPayment = payments.length > 0
    ? payments.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
    : null;

  return (
    <div className="space-y-4 p-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="flex size-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="glass-card rounded-xl p-5 animate-slide-up delay-1">
        <div className="flex items-center gap-4">
          <ProfilePhoto
            image={member.image}
            name={member.firstName}
            className="size-14"
            textClassName="text-lg"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
              {memberName}
            </h2>
            <span
              className={`mt-1.5 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                ({
                  Active: "bg-emerald-500/10 text-emerald-400",
                  Overdue: "bg-red-500/10 text-red-400",
                  Frozen: "bg-cyan-500/10 text-cyan-400",
                  Expired: "bg-red-500/10 text-red-400",
                } as Record<string, string>)[member.status]
              }`}
            >
              {member.status}
            </span>
          </div>
          <Link
            href={`/members/${id}/edit`}
            aria-label="Edit member"
            className="flex size-10 items-center justify-center rounded-xl bg-white/[0.06] text-text-muted transition-all duration-200 hover:bg-white/[0.1] hover:text-text-primary min-h-[44px] min-w-[44px]"
          >
            <Pencil size={16} />
          </Link>
        </div>

        <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
          {latestPayment && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <History size={14} />
              </span>
              {member.plan
                ? `${member.plan.name}(₹${latestPayment.amount.toLocaleString("en-IN")}) — ${new Date(latestPayment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                : `₹${latestPayment.amount.toLocaleString("en-IN")} — ${new Date(latestPayment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
            </div>
          )}
          {member.gender && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex size-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <VenusAndMars size={14} />
              </span>
              {member.gender}
            </div>
          )}
          {member.endDate && (
            <div className="flex items-center gap-3 text-sm">
              <span className={`flex size-8 items-center justify-center rounded-lg ${
                new Date(member.endDate) < now
                  ? "bg-red-500/10 text-red-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}>
                <Calendar size={14} />
              </span>
              <span>
                {(() => {
                  const end = new Date(member.endDate);
                  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return end < now
                    ? `Overdue ${Math.abs(days)} days ago`
                    : days === 0
                      ? "Expires today"
                      : `${days} days remaining`;
                })()}
              </span>
            </div>
          )}
          <a href={`tel:${member.phone}`} className="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity">
            <span className="flex size-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <Phone size={14} />
            </span>
            {member.phone}
          </a>
          {member.address && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <MapPin size={14} />
              </span>
              {member.address}
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.04]">
              <Calendar size={14} />
            </span>
            Joined{" "}
            {new Date(member.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        <MemberQuickActions
          memberId={id}
          phone={member.phone}
          memberName={memberName}
          status={member.status}
          gymUserId={userId}
          gymName={gymName}
        />
      </div>

      <div className="animate-slide-up delay-2">
        <MemberDetailClient
          memberId={id}
          member={member}
          payments={payments}
          plans={plans}
          gymUserId={userId}
          gymName={gymName}
        />
      </div>
    </div>
  );
}
