import { Plus } from "lucide-react";
import Link from "next/link";
import { getMembersPaginated } from "@/lib/actions/members";
import { getGymConfig } from "@/lib/actions/settings";
import { getPlans } from "@/lib/actions/plans";
import MembersList from "./MembersList";
import { requireAdminPage } from "@/lib/auth";

export default async function MembersPage() {
  const user = await requireAdminPage();
  const userId = user.gymOwnerId;

  let result = { members: [] as any[], total: 0, hasMore: false };
  let membersError: string | null = null;
  let gymName: string | undefined;
  let plans: { id: string; name: string; price: number; durationDays: number }[] = [];
  try {
    [result, gymName, plans] = await Promise.all([
      getMembersPaginated(0, 20),
      getGymConfig().then((c) => c?.gymName ?? undefined),
      getPlans(userId).catch(() => []),
    ]);
  } catch (e) {
    membersError = e instanceof Error ? e.message : "Failed to load members";
  }

  return (
    <div className="space-y-4 px-4 pb-4 pt-0 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Members</h1>
          <p className="mt-0.5 text-sm text-text-muted">{result.total} total</p>
        </div>
        <Link
          href="/members/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:opacity-90 active:scale-[0.98] min-h-[44px]"
        >
          <Plus size={18} />
          Add
        </Link>
      </div>

      {membersError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          {membersError}
        </div>
      )}

      <MembersList initial={result.members} initialHasMore={result.hasMore} gymName={gymName} plans={plans} />
    </div>
  );
}
