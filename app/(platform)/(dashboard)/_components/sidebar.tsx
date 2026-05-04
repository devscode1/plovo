"use client";

import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { useWorkspace, Workspace } from "@/lib/firebase/workspace-context";
import { useAuth } from "@/lib/firebase/auth-context";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";

import { NavItem, Organization } from "./nav-item";
import { cn } from "@/lib/utils";

type SidebarProps = {
  storageKey?: string;
};

export const Sidebar = ({ storageKey = "t-sidebar-state" }: SidebarProps) => {
  const [expanded, setExpanded] = useLocalStorage<Record<string, any>>(
    storageKey,
    {}
  );

  const { user, loading: authLoading } = useAuth();
  const { workspaces, activeWorkspace, loading: workspaceLoading } = useWorkspace();

  const defaultAccordionValue: string[] = Object.keys(expanded).reduce(
    (acc: string[], key: string) => {
      if (expanded[key]) {
        acc.push(key);
      }

      return acc;
    },
    []
  );

  const onExpand = (id: string) => {
    setExpanded((curr) => ({
      ...curr,
      [id]: !expanded[id],
    }));
  };

  if (authLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-10 w-[50%]" />
        <Skeleton className="h-10 w-10" />
      </div>
    );
  }

  return (
    <>
      <div className="font-medium text-xs flex items-center mb-1">
        <span className="pl-4">Workspaces</span>
        <Link
          href="/select-workspace"
          className={cn(
            buttonVariants({
              size: "icon",
              variant: "ghost",
            }),
            "ml-auto"
          )}
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>
      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValue}
        className="space-y-2"
      >
        {workspaces.map((workspace) => (
          <NavItem
            key={workspace.id}
            isActive={activeWorkspace?.id === workspace.id}
            isExpanded={expanded[workspace.id]}
            organization={workspace as unknown as Organization}
            onExpand={onExpand}
          />
        ))}
      </Accordion>
    </>
  );
};
