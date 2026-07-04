import { getActivityLogs } from "@/lib/actions/activity";
import ActivityClient from "./ActivityClient";

export default async function ActivityPage() {
  const { logs, total } = await getActivityLogs(1);
  return <ActivityClient initialLogs={logs} initialTotal={total} />;
}
