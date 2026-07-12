import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkOnboardingStatus } from "@/lib/actions/onboarding";
import LandingHero from "@/components/LandingHero";
import LandingComparison from "@/components/LandingComparison";
import LandingPrograms from "@/components/LandingPrograms";
import LandingSocialProof from "@/components/LandingSocialProof";
import LandingPricing from "@/components/LandingPricing";
import LandingFAQ from "@/components/LandingFAQ";
import LandingCTA from "@/components/LandingCTA";
import LandingFooter from "@/components/LandingFooter";

function SectionDivider() {
  return (
    <div className="relative w-full h-px">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,138,0,0.15) 20%, rgba(255,138,0,0.25) 50%, rgba(255,138,0,0.15) 80%, transparent 100%)",
        }}
      />
    </div>
  );
}

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    const status = await checkOnboardingStatus();
    if (status.role === null) redirect("/onboarding");
    if (status.role === "MEMBER") redirect("/member");
    if (status.needsGymName || status.needsLocation || status.needsPlans) redirect("/onboarding");
    redirect("/dashboard");
  }

  return (
    <>
      <LandingHero />
      <LandingComparison />
      <SectionDivider />
      <LandingPrograms />
      <SectionDivider />
      <LandingSocialProof />
      <SectionDivider />
      <LandingPricing />
      <SectionDivider />
      <LandingFAQ />
      <SectionDivider />
      <LandingCTA />
      <LandingFooter />
    </>
  );
}
