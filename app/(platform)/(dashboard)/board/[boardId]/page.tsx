import { redirect } from "next/navigation";
import { ListContainer } from "./_components/list-container";
import { getLists } from "@/lib/firebase/lists";
import { getCards } from "@/lib/firebase/cards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { getBoard } from "@/lib/firebase/boards";

type BoardIdPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  let orgId: string | null = null;

  try {
    const ctx = await requireAuthContext();
    orgId = ctx.orgId;
  } catch {
    orgId = null;
  }

  if (!orgId) redirect("/select-workspace");

  const { boardId } = await params;

  const board = await getBoard(boardId);
  if (!board || board.orgId !== orgId) redirect(`/organization/${orgId}`);

  const lists = await getLists(boardId);

  const listsWithCards = await Promise.all(
    lists.map(async (list) => {
      const cards = await getCards(list.id);
      return { ...list, cards };
    })
  );

  return (
    <div className="p-4 h-full overflow-x-auto">
      <ListContainer boardId={boardId} data={listsWithCards} />
    </div>
  );
};

export default BoardIdPage;
