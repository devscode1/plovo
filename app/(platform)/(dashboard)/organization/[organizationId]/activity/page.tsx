import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";

import { Info } from "../_components/info";
import { ActivityList } from "./_components/activity-list";
import { getAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole } from "@/lib/firebase/workspaces";

const ActivityPage = async ({ params }: { params: Promise<{ organizationId: string }> }) => {
  const { organizationId } = await params;
  const ctx = await getAuthContext();

  let isAdmin = false;
  try {
    if (ctx.userId) {
      isAdmin = await requireAdminRole(organizationId, ctx.userId);
    }
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    redirect(`/organization/${organizationId}`);
  }

  return (
    <div className="w-full">
      <Info />
      <Separator className="my-2" />
      <Suspense fallback={<ActivityList.Skeleton />}>
        <ActivityList />
      </Suspense>
    </div>
  );
};

export default ActivityPage;
