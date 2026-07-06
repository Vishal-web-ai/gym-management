import { redirect } from "next/navigation";
import { updateMember, getMemberById } from "@/lib/actions/members";
import { getPlans } from "@/lib/actions/plans";
import MemberForm from "../../MemberForm";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";

type EditableMember = {
  id: string;
  firstName: string;
  phone: string;
  address?: string | null;
  status: string;
  gender?: string | null;
  endDate?: Date | null;
  planId?: string | null;
  image?: string | null;
};

type MemberPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
};

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  let member: EditableMember | null = null;
  let plans: MemberPlan[] = [];
  try {
    [member, plans] = await Promise.all([getMemberById(id), getPlans()]);
  } catch {
    // Database not configured yet
  }

  if (!member) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateMember(formData);
    redirect(`/members/${id}`);
  }

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Edit Member</h1>
      <div className="glass-card rounded-xl p-5">
        <MemberForm
          action={handleUpdate}
          submitLabel="Save Changes"
          plans={plans}
          defaultValues={{
            id: member.id,
            firstName: member.firstName,
            phone: member.phone,
            address: member.address ?? undefined,
            status: member.status,
            gender: member.gender ?? undefined,
            endDate: member.endDate ? member.endDate.toISOString() : undefined,
            planId: member.planId ?? undefined,
            image: member.image,
          }}
        />
      </div>
    </div>
  );
}
