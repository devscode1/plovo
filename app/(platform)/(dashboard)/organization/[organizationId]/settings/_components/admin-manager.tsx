"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { addWorkspaceAdmin } from "@/actions/add-workspace-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminManager = () => {
  const [email, setEmail] = useState("");

  const { execute, isLoading } = useAction(addWorkspaceAdmin, {
    onSuccess: (data) => {
      toast.success(`User ${data.email} is now a workspace admin!`);
      setEmail("");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    execute({ email });
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-semibold mb-4">Admin Management</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Grant workspace admin rights to another user. Admins can manage boards, invite members, and configure settings.
        <br />
        <strong>Note:</strong> The user must have a registered Plovo account before you can make them an admin.
      </p>

      <form onSubmit={onSubmit} className="flex gap-x-2 max-w-md">
        <Input
          placeholder="User's email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
        <Button type="submit" disabled={isLoading || !email}>
          Make Admin
        </Button>
      </form>
    </div>
  );
};
