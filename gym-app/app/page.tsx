"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { checkOnboardingStatus } from "@/lib/actions/onboarding";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.replace("/sign-in");
      return;
    }

    checkOnboardingStatus()
      .then((status) => {
        if (status.needsGymName || status.needsPlans) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/onboarding"));
  }, [isLoaded, userId, router]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
