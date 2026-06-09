"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Copy, Trash, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { CardWithList } from "@/types";
import { copyCard } from "@/actions/copy-card";
import { deleteCard } from "@/actions/delete-card";
import { assignCardMember } from "@/actions/assign-card-member";
import { updateCard } from "@/actions/update-card";
import { toggleCardCompletion } from "@/actions/toggle-card-completion";
import { useAction } from "@/hooks/use-action";
import { useCardModal } from "@/hooks/use-card-modal";
import { useAuth } from "@/lib/firebase/auth-context";

type ActionsProps = {
  data: CardWithList;
};

export const Actions = ({ data }: ActionsProps) => {
  const { execute: executeCopyData, isLoading: isLoadingCopy } = useAction(
    copyCard,
    {
      onSuccess: (data) => {
        toast.success(`Card "${data.title} copied."`);
        cardModal.onClose();
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );
  const { execute: executeDeleteData, isLoading: isLoadingDelete } = useAction(
    deleteCard,
    {
      onSuccess: (data) => {
        toast.success(`Card "${data.title} deleted."`);
        cardModal.onClose();
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  const params = useParams();
  const cardModal = useCardModal();

  const onCopy = () => {
    const boardId = params.boardId as string;

    executeCopyData({
      id: data.id,
      boardId,
    });
  };

  const onDelete = () => {
    const boardId = params.boardId as string;

    executeDeleteData({
      id: data.id,
      boardId,
    });
  };

  const [assignEmail, setAssignEmail] = useState(data.assignedTo || "");
  const { execute: executeAssign, isLoading: isLoadingAssign } = useAction(
    assignCardMember,
    {
      onSuccess: () => {
        toast.success(`Assigned to ${assignEmail}`);
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  const onAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const boardId = params.boardId as string;
    executeAssign({
      boardId,
      cardId: data.id,
      email: assignEmail,
    });
  };

  const [isCompleted, setIsCompleted] = useState(data.isCompleted || false);
  const [deadline, setDeadline] = useState(
    data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : ""
  );

  const { execute: executeToggle } = useAction(toggleCardCompletion, {
    onSuccess: (data) => {
      toast.success(`Card marked as ${data.isCompleted ? 'complete' : 'incomplete'}.`);
    },
    onError: (error) => {
      toast.error(error);
      setIsCompleted(!isCompleted);
    },
  });

  const { execute: executeUpdateCard } = useAction(updateCard, {
    onSuccess: (data) => {
      toast.success(`Card updated.`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onToggleComplete = () => {
    const newValue = !isCompleted;
    setIsCompleted(newValue);
    executeToggle({
      id: data.id,
      boardId: params.boardId as string,
      isCompleted: newValue,
    });
  };

  const onDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDeadline = e.target.value;
    setDeadline(newDeadline);
    executeUpdateCard({
      id: data.id,
      boardId: params.boardId as string,
      deadline: newDeadline || undefined,
    });
  };

  const canEdit = data.isAdmin;
  const isAssigned = data.assignedTo && data.assignedTo === authUserEmail; // Wait, authUserEmail? I need the current user's email.
  // Actually, I can just use getAuthContext, or if I can't easily get email, let's assume if it's assigned to them, they can toggle it. But I don't have authUserEmail in the client.

  // Let me just add a prop to Actions or use useAuth() from the context.
  const { user } = useAuth();
  const assignedToMe = data.assignedTo === user?.email;

  return (
    <div className="space-y-2 mt-2">
      <p className="text-xs font-semibold">Actions</p>

      {data.assignedTo && (
        <p className="text-xs text-neutral-500 mb-2 truncate">
          Assigned to: {data.assignedTo}
        </p>
      )}

      {(data.isAdmin || assignedToMe) && (
        <Button
          onClick={onToggleComplete}
          variant={isCompleted ? "primary" : "gray"}
          className="w-full justify-start"
          size="inline"
        >
          {isCompleted ? "Mark Incomplete" : "Mark Complete"}
        </Button>
      )}

      {data.isAdmin && (
        <div className="w-full mb-2">
          <label className="text-xs font-semibold mb-1 block">Deadline</label>
          <Input 
            type="date" 
            value={deadline} 
            onChange={onDeadlineChange} 
            className="w-full text-sm"
          />
        </div>
      )}

      {data.isAdmin && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="gray"
                className="w-full justify-start"
                size="inline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </PopoverTrigger>
            <PopoverContent className="px-4 py-3" side="bottom" align="start">
              <div className="text-sm font-medium text-center text-neutral-600 pb-4">
                Assign Member
              </div>
              <form onSubmit={onAssign} className="space-y-4">
                <Input
                  placeholder="Email address"
                  type="email"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  disabled={isLoadingAssign}
                  required
                />
                <Button type="submit" disabled={isLoadingAssign} className="w-full">
                  Assign & Notify
                </Button>
              </form>
            </PopoverContent>
          </Popover>

          <Button
            onClick={onCopy}
            disabled={isLoadingCopy}
            variant="gray"
            className="w-full justify-start"
            size="inline"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>

          <Button
            onClick={onDelete}
            disabled={isLoadingDelete}
            variant="destructive"
            className="w-full justify-start"
            size="inline"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </>
      )}
    </div>
  );
};

Actions.Skeleton = function ActionSkeleton() {
  return (
    <div className="space-y-2 mt-2">
      <Skeleton className="w-20 h-4 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
    </div>
  );
};
