import { requireAdminPage } from "@/lib/auth";

export default async function AttendanceLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <>{children}</>;
}
