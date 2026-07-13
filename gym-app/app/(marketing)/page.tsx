import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { checkOnboardingStatus } from "@/lib/actions/onboarding";
import LandingComparison from "@/components/LandingComparison";
import LandingSocialProof from "@/components/LandingSocialProof";
import LandingPricing from "@/components/LandingPricing";
import LandingFAQ from "@/components/LandingFAQ";
import LandingCTA from "@/components/LandingCTA";
import LandingFooter from "@/components/LandingFooter";

const LandingHero = dynamic(() => import("@/components/LandingHero"), {
  loading: () => <div className="h-screen animate-pulse bg-[#0a0604]" />,
});
const LandingPrograms = dynamic(() => import("@/components/LandingPrograms"), {
  loading: () => <div className="h-96 animate-pulse bg-white/5" />,
});

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
