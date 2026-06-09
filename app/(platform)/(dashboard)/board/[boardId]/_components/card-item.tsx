"use client";

import { Card } from "@/lib/firebase/cards";
import { Draggable } from "@hello-pangea/dnd";
import { useCardModal } from "@/hooks/use-card-modal";

type CardItemProps = {
  data: Card;
  index: number;
};

export const CardItem = ({ data, index }: CardItemProps) => {
  const cardModal = useCardModal();

  const assignees = data.assignees || [];
  const allAssignees = [...assignees, data.assignedTo].filter(Boolean) as string[];

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className={`border-2 py-2 px-3 text-sm rounded-md shadow-sm ${
            data.deadline && new Date(data.deadline) < new Date() && !data.isCompleted
              ? "border-red-500 bg-red-100 text-red-900 hover:border-red-700"
              : data.isCompleted 
              ? "border-green-500 bg-green-100 text-green-900 hover:border-green-700"
              : "border-transparent bg-white hover:border-black"
          }`}
        >
          <div className="truncate">{data.title}</div>
          {allAssignees.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {allAssignees.slice(0, 3).map((email, idx) => {
                const name = email.split("@")[0];
                return (
                  <div key={idx} className="flex items-center gap-1 bg-neutral-100 rounded-full pr-2 pb-0.5 pt-0.5 pl-0.5 border border-neutral-200">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-[10px] font-semibold text-blue-700">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[60px]">
                      {name}
                    </span>
                  </div>
                );
              })}
              {allAssignees.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-semibold text-neutral-600 border border-neutral-300">
                  +{allAssignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
