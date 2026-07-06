import { requireAdminPage } from "@/lib/auth";

export default async function NewMemberLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <>{children}</>;
}
