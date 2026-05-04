import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem } from "@/components/activity-item";
import { getAuditLogs } from "@/lib/firebase/audit-log";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";

export const ActivityList = async () => {
  let orgId: string | null = null;

  try {
    const ctx = await requireAuthContext();
    orgId = ctx.orgId;
  } catch {
    orgId = null;
  }

  if (!orgId) return redirect("/select-workspace");

  const auditLogs = await getAuditLogs(orgId);

  return (
    <ol className="space-y-4 mt-4">
      <p className="hidden last:block text-xs text-center text-muted-foreground">
        No activity found inside this workspace.
      </p>

      {auditLogs.map((log) => (
        <ActivityItem key={log.id} data={log} />
      ))}
    </ol>
  );
};

ActivityList.Skeleton = function ActivityListSkeleton() {
  return (
    <ol className="space-y-4 mt-4">
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[50%] h-14" />
      <Skeleton className="w-[70%] h-14" />
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[75%] h-14" />
    </ol>
  );
};
