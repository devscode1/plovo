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

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className={`truncate border-2 py-2 px-3 text-sm rounded-md shadow-sm ${
            data.deadline && new Date(data.deadline) < new Date() && !data.isCompleted
              ? "border-red-500 bg-red-100 text-red-900 hover:border-red-700"
              : data.isCompleted 
              ? "border-green-500 bg-green-100 text-green-900 hover:border-green-700"
              : "border-transparent bg-white hover:border-black"
          }`}
        >
          {data.title}
        </div>
      )}
    </Draggable>
  );
};
