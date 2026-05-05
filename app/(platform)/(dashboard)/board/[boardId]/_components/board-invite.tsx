"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAction } from "@/hooks/use-action";
import { inviteBoardMember } from "@/actions/invite-board-member";

interface BoardInviteProps {
  boardId: string;
}

export const BoardInvite = ({ boardId }: BoardInviteProps) => {
  const [email, setEmail] = useState("");

  const { execute, isLoading } = useAction(inviteBoardMember, {
    onSuccess: () => {
      toast.success("Member invited successfully!");
      setEmail("");
      document.getElementById("close-invite-popover")?.click();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    execute({ boardId, email });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-4 pt-3 pb-4" side="bottom" align="start" sideOffset={10}>
        <div className="text-sm font-medium text-center text-neutral-600 pb-4">
          Invite to Board
        </div>
        <PopoverClose id="close-invite-popover" asChild>
          <Button
            className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            id="email"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            Send Invite
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};
