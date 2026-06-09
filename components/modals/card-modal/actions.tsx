"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Copy, Trash, UserPlus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

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
  const queryClient = useQueryClient();

  const { execute: executeCopyData, isLoading: isLoadingCopy } = useAction(
    copyCard,
    {
      onSuccess: (data) => {
        toast.success(`Card "${data.title}" copied.`);
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
        toast.success(`Card "${data.title}" deleted.`);
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

  const assignees = data.assignees || [];
  const allAssignees = [...assignees, data.assignedTo].filter(Boolean) as string[];
  const { user } = useAuth();
  const assignedToMe = allAssignees.map(a => String(a).toLowerCase()).includes(String(user?.email || "").toLowerCase());

  const [lastActionEmail, setLastActionEmail] = useState("");
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const { execute: executeAssign, isLoading: isLoadingAssign } = useAction(
    assignCardMember,
    {
      onSuccess: () => {
        toast.success(`Assignment updated for ${lastActionEmail}`);
        queryClient.invalidateQueries({
          queryKey: ["card", data.id]
        });
        queryClient.invalidateQueries({
          queryKey: ["card-logs", data.id]
        });
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  const [isCompleted, setIsCompleted] = useState(data.isCompleted || false);
  const [deadline, setDeadline] = useState(
    data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : ""
  );

  // Keep local state in sync when query data updates (e.g. after close/reopen)
  useEffect(() => {
    setIsCompleted(data.isCompleted || false);
  }, [data.isCompleted]);

  useEffect(() => {
    setDeadline(data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "");
  }, [data.deadline]);

  const { execute: executeToggle } = useAction(toggleCardCompletion, {
    onSuccess: (updatedCard) => {
      toast.success(`Card marked as ${updatedCard.isCompleted ? 'complete' : 'incomplete'}.`);
      // Invalidate so query cache reflects truth
      queryClient.invalidateQueries({ queryKey: ["card", data.id] });
      queryClient.invalidateQueries({ queryKey: ["card-logs", data.id] });
    },
    onError: (error) => {
      toast.error(error);
      // Revert optimistic update
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

  const { data: members = [], isLoading: isLoadingMembers } = useQuery<any[]>({
    queryKey: ["board-members", params.boardId],
    queryFn: () => fetcher(`/api/boards/${params.boardId}/members`),
  });

  return (
    <div className="space-y-2 mt-2">
      <p className="text-xs font-semibold">Actions</p>

      {allAssignees.length > 0 && (
        <div className="text-xs text-neutral-500 mb-2">
          Assigned to:
          <div className="flex flex-wrap gap-1 mt-1">
            {allAssignees.map((email, idx) => (
              <span key={idx} className="bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5 truncate max-w-[120px]">
                {email.split("@")[0]}
              </span>
            ))}
          </div>
        </div>
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
          <div className="relative w-full">
            <Button
              variant="gray"
              className="w-full justify-start"
              size="inline"
              onClick={() => setIsAssignOpen(!isAssignOpen)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign
            </Button>

            {isAssignOpen && (
              <div className="absolute right-0 top-full mt-1 w-[260px] z-50 rounded-md border bg-white shadow-lg p-3">
                <div className="text-sm font-medium text-center text-neutral-600 pb-3">
                  Assign Member
                </div>
                <div className="flex flex-col max-h-[220px] overflow-y-auto overflow-x-hidden -mx-3">
                  {isLoadingMembers ? (
                    <div className="px-4 py-2 text-sm text-muted-foreground">Loading members...</div>
                  ) : !Array.isArray(members) || members.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-muted-foreground">No available members.</div>
                  ) : (
                    members.map((member) => {
                      const isAssigned = allAssignees.includes(member.email);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setIsAssignOpen(false);
                            setLastActionEmail(member.email);
                            const boardId = params.boardId as string;
                            executeAssign({
                              boardId,
                              cardId: data.id,
                              email: member.email,
                            });
                          }}
                          disabled={isLoadingAssign}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 flex items-center justify-between disabled:opacity-50 cursor-pointer ${isAssigned ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-sm font-medium text-blue-700">
                              {(member.displayName || member.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="font-medium truncate">{member.displayName || member.email}</span>
                              {member.displayName && (
                                <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                              )}
                            </div>
                          </div>
                          {isAssigned && (
                            <div className="text-blue-600 ml-2 text-xs font-medium flex-shrink-0">Assigned</div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

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
