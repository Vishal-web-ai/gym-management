import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkOnboardingStatus } from "@/lib/actions/onboarding";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const status = await checkOnboardingStatus();

  if (status.role === null) redirect("/onboarding");
  if (status.role === "MEMBER") redirect("/member");
  if (status.needsGymName || status.needsLocation || status.needsPlans) redirect("/onboarding");

  redirect("/dashboard");
}
