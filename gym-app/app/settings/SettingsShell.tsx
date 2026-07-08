"use client";

import { useQuery } from "@tanstack/react-query";
import { getGymConfig } from "@/lib/actions/settings";
import { getPlans } from "@/lib/actions/plans";
import SettingsClient from "./SettingsClient";

export default function SettingsShell() {
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const [config, plans] = await Promise.all([
        getGymConfig().then((c: any) => c ?? { gymName: "Iron Forge Gym", ownerName: "", gymLat: null, gymLng: null, gymRadius: null }),
        getPlans(),
      ]);
      return { config, plans };
    },
    staleTime: 60_000,
  });

  if (isLoading) return null; // parent Suspense handles skeleton

  return <SettingsClient config={data!.config} plans={data!.plans} />;
}
