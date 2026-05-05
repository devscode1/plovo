import { redirect } from "next/navigation";
import { ListContainer } from "./_components/list-container";
import { getLists } from "@/lib/firebase/lists";
import { getCards } from "@/lib/firebase/cards";
import { getAuthContext } from "@/lib/firebase/auth-helpers";
import { getBoard } from "@/lib/firebase/boards";

type BoardIdPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const ctx = await getAuthContext();
  const orgId = ctx.orgId;

  if (!orgId) redirect("/select-workspace");

  const { boardId } = await params;

  const board = await getBoard(boardId);
  if (!board || board.orgId !== orgId) redirect(`/organization/${orgId}`);

  const lists = await getLists(boardId);

  const { getUserRole } = await import("@/lib/firebase/workspaces");
  const role = ctx.userId ? await getUserRole(board.orgId, ctx.userId) : null;
  const isAdmin = role === "owner" || role === "admin";

  const listsWithCards = await Promise.all(
    lists.map(async (list) => {
      const cards = await getCards(list.id);
      return { ...list, cards };
    })
  );

  return (
    <div className="p-4 h-full overflow-x-auto">
      <ListContainer boardId={boardId} data={listsWithCards} isAdmin={isAdmin} />
    </div>
  );
};

export default BoardIdPage;
