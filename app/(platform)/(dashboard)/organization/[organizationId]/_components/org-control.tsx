"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/lib/firebase/workspace-context";

export const OrgControl = () => {
  const params = useParams();
  const { setActiveWorkspace, workspaces } = useWorkspace();

  useEffect(() => {
    const workspaceId = params.organizationId as string;
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setActiveWorkspace(workspace);
      document.cookie = `activeOrgId=${workspaceId}; path=/; max-age=31536000`;
    }
  }, [params.organizationId, workspaces, setActiveWorkspace]);

  return null;
};
