import { type ReactNode } from "react";

export default function AnimLayout({ children }: { children: ReactNode }) {
  return <main className="flex-1 pb-20 md:pb-8">{children}</main>;
}
