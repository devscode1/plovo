"use client";

import { useWorkspace } from "@/lib/firebase/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";

export const Info = () => {
  const { activeWorkspace, loading } = useWorkspace();

  if (loading) return <Info.Skeleton />;

  return (
    <div className="flex items-center gap-x-4">
      <div className="w-[60px] h-[60px] relative flex items-center justify-center bg-primary rounded-md">
        <span className="text-2xl font-bold text-primary-foreground">
          {activeWorkspace?.name?.[0]?.toUpperCase() || "W"}
        </span>
      </div>

      <div className="space-y-1">
        <p className="font-semibold text-xl">{activeWorkspace?.name || "Workspace"}</p>
      </div>
    </div>
  );
};

Info.Skeleton = function SkeletonInfo() {
  return (
    <div className="flex items-center gap-x-4">
      <div className="w-[60px] h-[60px] relative">
        <Skeleton className="w-full h-full absolute" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-[200px]" />

        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    </div>
  );
};
