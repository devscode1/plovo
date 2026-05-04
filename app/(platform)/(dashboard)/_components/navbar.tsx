"use client";

import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useWorkspace } from "@/lib/firebase/workspace-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormPopover } from "@/components/form/form-popover";
import { Logo } from "@/components/logo";
import { MobileSidebar } from "./mobile-sidebar";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { UserMenu } from "./user-menu";

export const Navbar = () => {
  const { loading } = useAuth();
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();

  if (loading || workspaceLoading) {
    return (
      <nav className="fixed z-50 top-0 w-full px-4 h-14 border-b shadow-sm bg-white flex items-center">
        <div className="flex items-center gap-x-4">
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="ml-auto flex items-center gap-x-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed z-50 top-0 w-full px-4 h-14 border-b shadow-sm bg-white flex items-center">
      <MobileSidebar />
      <div className="flex items-center gap-x-4">
        <div className="hidden md:flex">
          <Logo />
        </div>

        <FormPopover align="start" side="bottom" sideOffset={18}>
          <Button
            size="sm"
            className="rounded-sm md:flex md:gap-x-1 h-auto py-1.5 px-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:block">Create</span>
          </Button>
        </FormPopover>
      </div>

      <div className="ml-auto flex items-center gap-x-2">
        <WorkspaceSwitcher />
        <UserMenu />
      </div>
    </nav>
  );
};
