"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { addWorkspaceMember } from "@/actions/add-workspace-member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const MemberManager = () => {
  const [email, setEmail] = useState("");

  const { execute, isLoading } = useAction(addWorkspaceMember, {
    onSuccess: (data) => {
      toast.success(`User ${data.email} is now a workspace member!`);
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
      <h3 className="text-xl font-semibold mb-4">Add Member</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Add a regular member to this workspace. Members can view boards but can only edit cards they are explicitly assigned to.
        <br />
        <strong>Note:</strong> The user must have a registered Plovo account before you can add them.
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
          Add Member
        </Button>
      </form>
    </div>
  );
};
