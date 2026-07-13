import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { checkOnboardingStatus } from "@/lib/actions/onboarding";

const LandingHero = dynamic(() => import("@/components/LandingHero"), {
  loading: () => <div className="h-screen animate-pulse bg-[#0a0604]" />,
});
const LandingPrograms = dynamic(() => import("@/components/LandingPrograms"), {
  loading: () => <div className="h-96 animate-pulse bg-white/5" />,
});
const LandingComparison = dynamic(() => import("@/components/LandingComparison"), {
  loading: () => <div className="h-64 animate-pulse bg-white/5" />,
});
const LandingSocialProof = dynamic(() => import("@/components/LandingSocialProof"), {
  loading: () => <div className="h-64 animate-pulse bg-white/5" />,
});
const LandingPricing = dynamic(() => import("@/components/LandingPricing"), {
  loading: () => <div className="h-96 animate-pulse bg-white/5" />,
});
const LandingFAQ = dynamic(() => import("@/components/LandingFAQ"), {
  loading: () => <div className="h-64 animate-pulse bg-white/5" />,
});
const LandingCTA = dynamic(() => import("@/components/LandingCTA"), {
  loading: () => <div className="h-48 animate-pulse bg-white/5" />,
});
const LandingFooter = dynamic(() => import("@/components/LandingFooter"), {
  loading: () => <div className="h-32 animate-pulse bg-white/5" />,
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
