import { Board as BoardType } from "@/lib/firebase/boards";

import { BoardTitleForm } from "./board-title-form";
import { BoardOptions } from "./board-options";
import { BoardInvite } from "./board-invite";

type BoardNavbarProps = {
  data: BoardType;
  isAdmin?: boolean;
};

export const BoardNavbar = async ({ data, isAdmin }: BoardNavbarProps) => {
  return (
    <div className="w-full h-14 z-[40] bg-black/50 fixed top-14 flex items-center px-6 gap-x-4 text-white">
      <BoardTitleForm data={data} />

      <div className="ml-auto flex items-center gap-x-2">
        {isAdmin && (
          <>
            <BoardInvite boardId={data.id} />
            <BoardOptions id={data.id} />
          </>
        )}
      </div>
    </div>
  );
};
