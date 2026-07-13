import Link from "next/link";
import { notFound } from "next/navigation";
import { displayPhone } from "@/lib/types";

import { Pencil, ArrowLeft, Phone, Calendar, MapPin, VenusAndMars, Dumbbell, UserPlus, IndianRupee } from "lucide-react";

export const dynamic = "force-dynamic";
import { requireAdminPage } from "@/lib/auth";
import { getNow } from "@/lib/now";
import {
  getMemberById,
  getPaymentsByMemberId,
} from "@/lib/actions/members";
import { getGymConfig } from "@/lib/actions/settings";
import { getPlans } from "@/lib/actions/plans";
import MemberQuickActions from "./MemberQuickActions";
import FreezeToggle from "./FreezeToggle";
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

function overdueText(endDate: Date, now: Date): string {
  const end = new Date(endDate);
  let months = (now.getFullYear() - end.getFullYear()) * 12 + (now.getMonth() - end.getMonth());
  let days = now.getDate() - end.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  const parts: string[] = [];
  if (months > 0) parts.push(`${months} month`);
  if (days > 0) parts.push(`${days} days`);
  return parts.length ? `Overdue by ${parts.join(" ")}` : "Expires today";
}

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
    <div className="space-y-4 px-3 pb-3 pt-0 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="flex size-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="rounded-[20px] border border-border bg-bg-surface p-[18px] animate-slide-up delay-1">
        {/* Header */}
        <div className="flex items-start gap-4">
          <ProfilePhoto
            image={member.image}
            name={member.firstName}
            className="size-14 shrink-0"
            textClassName="text-lg"
          />
          <div className="min-w-0 flex-1 pt-[2px]">
            <h2 className="truncate text-[22px] font-bold tracking-tight text-text-primary member-name" style={{ fontFamily: "var(--font-display)" }}>
              {memberName}
            </h2>
            <span
              className={`mt-[6px] inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                ({
                  Active: "bg-emerald-500/10 text-emerald-400",
                  Overdue: "bg-red-500/10 text-red-400",
                  Frozen: "bg-cyan-500/10 text-cyan-400",
                  Expired: "bg-red-500/10 text-red-400",
                } as Record<string, string>)[member.status]
              }`}
            >
              {member.status === "Expired" && member.endDate
                ? overdueText(new Date(member.endDate), now)
                : member.status}
            </span>
          </div>
          <Link
            href={`/members/${id}/edit`}
            aria-label="Edit member"
            className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06] text-text-muted transition-all duration-200 hover:bg-white/[0.1] hover:text-text-primary min-h-[44px] min-w-[44px]"
          >
            <Pencil size={15} />
          </Link>
        </div>

        {/* Info Grid */}
        <div className="member-info mt-[18px] divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {/* Row 1: Plan | Start Date */}
          <div className="grid grid-cols-2">
            <div className="flex items-center gap-3 py-[14px] pr-4">
              <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-orange-500/10">
                <Dumbbell size={18} className="text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">Plan</p>
                <p className="text-[15px] font-semibold text-text-primary">
                  {member.plan ? `${member.plan.name} (₹${member.plan.price})` : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-[14px] pl-4 border-l border-white/[0.06]">
              <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-amber-500/10">
                <Calendar size={18} className="text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">Start Date</p>
                <p className="text-[15px] font-semibold text-text-primary">
                  {latestPayment
                    ? new Date(latestPayment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Gender | End Date */}
          <div className="grid grid-cols-2">
            <div className="flex items-center gap-3 py-[14px] pr-4">
              <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-purple-500/10">
                <VenusAndMars size={18} className="text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">Gender</p>
                <p className="text-[15px] font-semibold text-text-primary">{member.gender ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-[14px] pl-4 border-l border-white/[0.06]">
              <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-yellow-500/10">
                <Calendar size={18} className="text-yellow-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">End Date</p>
                <p className={`text-[15px] font-semibold ${
                  member.endDate && new Date(member.endDate) < now ? "text-red-400" : "text-text-primary"
                }`}>
                  {member.endDate
                    ? (() => {
                        const end = new Date(member.endDate);
                        if (end < now) return overdueText(end, now);
                        return end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                      })()
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Phone | Location */}
          <div className="grid grid-cols-2">
            <div className="flex items-center gap-3 py-[14px] pr-4">
              <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-purple-500/10">
                <Phone size={18} className="text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">Phone</p>
                <a
                  href={`tel:${member.phone}`}
                  className="text-[15px] font-semibold text-text-primary hover:opacity-80 transition-opacity"
                >
                  {displayPhone(member.phone)}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 py-[14px] pl-4 border-l border-white/[0.06]">
              <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-orange-500/10">
                <MapPin size={18} className="text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">Location</p>
                <p className="text-[15px] font-semibold text-text-primary">{member.address ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Row 4: Joined On (full width) */}
          <div className="grid grid-cols-1">
            <div className="flex items-center gap-3 py-[14px]">
              <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gray-500/10">
                <UserPlus size={18} className="text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">Joined On</p>
                <p className="text-[15px] font-semibold text-text-primary">
                  {new Date(member.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
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

      <div className="grid grid-cols-2 gap-3 animate-slide-up delay-2">
        <Link
          href={`/members/${id}/payments`}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 min-h-[48px] transition-colors"
        >
          <IndianRupee size={16} />
          Payments
        </Link>
        <FreezeToggle memberId={id} status={member.status} />
      </div>
    </div>
  );
}
