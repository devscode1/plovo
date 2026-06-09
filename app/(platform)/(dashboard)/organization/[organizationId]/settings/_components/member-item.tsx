"use client";

import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { removeWorkspaceMember } from "@/actions/remove-workspace-member";
import { Button } from "@/components/ui/button";
import { WorkspaceMember } from "@/lib/firebase/workspaces";

interface MemberItemProps {
  member: WorkspaceMember;
  isCurrentUser: boolean;
}

export const MemberItem = ({ member, isCurrentUser }: MemberItemProps) => {
  const { execute, isLoading } = useAction(removeWorkspaceMember, {
    onSuccess: () => {
      toast.success(`Removed ${member.displayName} from workspace.`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onRemove = () => {
    execute({ memberId: member.id });
  };

  const canRemove = member.role !== "owner" && !isCurrentUser;

  return (
    <li className="flex justify-between items-center p-3 border rounded-md">
      <div>
        <p className="font-medium">
          {member.displayName} ({member.email})
          {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
        </p>
        <p className="text-xs text-muted-foreground capitalize">Role: {member.role}</p>
      </div>
      {canRemove && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onRemove} 
          disabled={isLoading}
        >
          Remove
        </Button>
      )}
    </li>
  );
};
