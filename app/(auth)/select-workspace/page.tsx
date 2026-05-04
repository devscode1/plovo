"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useWorkspace, Workspace } from "@/lib/firebase/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import { Plus } from "lucide-react";

export default function SelectWorkspacePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { workspaces, activeWorkspace, loading, createWorkspace } = useWorkspace();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSelectWorkspace = (workspace: Workspace) => {
    document.cookie = `activeOrgId=${workspace.id}; path=/; max-age=31536000`;
    router.push(`/organization/${workspace.id}`);
  };

  const handleCreateWorkspace = async (e: FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setCreating(true);
    try {
      const workspace = await createWorkspace(newWorkspaceName);
      handleSelectWorkspace(workspace);
    } catch {
      console.error("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-4 text-2xl font-bold text-foreground">Select a workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a workspace to continue
          </p>
        </div>

        <div className="space-y-3">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => handleSelectWorkspace(workspace)}
              className={`w-full p-4 text-left rounded-lg border transition ${
                activeWorkspace?.id === workspace.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <p className="font-medium">{workspace.name}</p>
              <p className="text-sm text-muted-foreground">
                {workspace.ownerId === user.uid ? "Owner" : "Member"}
              </p>
            </button>
          ))}
        </div>

        {showForm ? (
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input
                id="workspaceName"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="My Workspace"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={creating || !newWorkspaceName.trim()}
              >
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create new workspace
          </Button>
        )}
      </div>
    </div>
  );
}
