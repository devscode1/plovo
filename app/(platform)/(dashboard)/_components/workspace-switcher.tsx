"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace, Workspace } from "@/lib/firebase/workspace-context";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const WorkspaceSwitcher = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSelect = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    document.cookie = `activeOrgId=${workspace.id}; path=/; max-age=31536000`;
    setOpen(false);
    router.push(`/organization/${workspace.id}`);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const workspace = await createWorkspace(newName);
      handleSelect(workspace);
    } catch {
      console.error("Failed to create workspace");
    } finally {
      setCreating(false);
      setNewName("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="max-w-[130px] md:max-w-[200px] justify-between"
        >
          <span className="truncate">{activeWorkspace?.name || "Select workspace"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <div className="space-y-1">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => handleSelect(workspace)}
              className={cn(
                "w-full flex items-center gap-x-2 px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition",
                activeWorkspace?.id === workspace.id && "bg-muted"
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4",
                  activeWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate">{workspace.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t">
          <div className="space-y-2">
            <Label htmlFor="workspaceName" className="text-xs">New workspace</Label>
            <div className="flex gap-1">
              <Input
                id="workspaceName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Workspace name"
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                size="sm"
                className="h-8 w-8 p-0"
                disabled={creating || !newName.trim()}
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
