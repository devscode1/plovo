"use client";

import { ElementRef, useRef, useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { FormInput } from "@/components/form/form-input";
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/update-card";
import { toggleCardCompletion } from "@/actions/toggle-card-completion";
import { useAuth } from "@/lib/firebase/auth-context";
import { CardWithList } from "@/types";

type HeaderProps = {
  data: CardWithList;
};

export const Header = ({ data }: HeaderProps) => {
  const [title, setTitle] = useState(data.title);
  const queryClient = useQueryClient();
  const params = useParams();
  
  const { user } = useAuth();
  const assignedToMe = data.assignedTo === user?.email;

  const { execute } = useAction(updateCard, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", data.id],
      });

      toast.success(`Renamed to "${data.title}"`);
      setTitle(data.title);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const inputRef = useRef<ElementRef<"input">>(null);

  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const boardId = params.boardId as string;

    if (title === data.title) return;

    execute({
      title,
      boardId,
      id: data.id,
    });
  };

  const { execute: executeToggle, isLoading: isToggling } = useAction(
    toggleCardCompletion,
    {
      onSuccess: (cardData) => {
        queryClient.invalidateQueries({ queryKey: ["card", cardData.id] });
        queryClient.invalidateQueries({ queryKey: ["card-logs", cardData.id] });
        toast.success(`Task marked as ${cardData.isCompleted ? "completed" : "incomplete"}`);
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  const onToggleComplete = () => {
    executeToggle({
      id: data.id,
      boardId: params.boardId as string,
      isCompleted: !data.isCompleted,
    });
  };

  return (
    <div className="flex items-start gap-x-3 mb-6 w-full">
      <Layout className="h-5 w-5 mt-1 text-neutral-700" />
      <div className="w-full">
        <div className="flex items-center gap-x-2">
          {(data.isAdmin || assignedToMe) && (
            <input
              type="checkbox"
              checked={!!data.isCompleted}
              onChange={onToggleComplete}
              disabled={isToggling}
              className="w-4 h-4 cursor-pointer"
            />
          )}
          {(data.isAdmin || assignedToMe) ? (
            <form action={onSubmit} className="flex-1">
              <FormInput
                id="title"
                onBlur={onBlur}
                ref={inputRef}
                defaultValue={title}
                className={`font-semibold text-lg px-1 text-neutral-700 bg-transparent border-transparent relative -left-1.5 w-[95%] focus-visible:bg-white focus-visible:border-input mb-0.5 truncate ${data.isCompleted ? "line-through text-neutral-500" : ""}`}
              />
            </form>
          ) : (
            <p className={`font-semibold text-lg px-1 text-neutral-700 mb-0.5 truncate ${data.isCompleted ? "line-through text-neutral-500" : ""}`}>
              {title}
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          In list <span className="underline">{data.list.title}</span>
        </p>
      </div>
    </div>
  );
};

Header.Skeleton = function HeaderSkeleton() {
  return (
    <div className="flex items-start gap-x-3 mb-6">
      <Skeleton className="h-6 w-6 mt-1 bg-neutral-200" />
      <div>
        <Skeleton className="w-24 h-6 mb-1 bg-neutral-200" />
        <Skeleton className="w-12 h-4 bg-neutral-200" />
      </div>
    </div>
  );
};
