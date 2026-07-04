import { getGymConfig } from "@/lib/actions/settings";
import { getPlans } from "@/lib/actions/plans";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  let config: any = { gymName: "Iron Forge Gym", ownerName: "", gymLat: null, gymLng: null, gymRadius: null };
  let plans: any[] = [];
  try {
    [config, plans] = await Promise.all([
      getGymConfig().then((c: any) => c ?? { gymName: "Iron Forge Gym", ownerName: "", gymLat: null, gymLng: null, gymRadius: null }),
      getPlans(),
    ]);
  } catch {}

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
      <SettingsClient config={config} plans={plans} />
    </div>
  );
}
