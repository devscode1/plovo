import { notFound, redirect } from "next/navigation";
import { BoardNavbar } from "./_components/board-navbar";
import { getBoard } from "@/lib/firebase/boards";
import { getLists } from "@/lib/firebase/lists";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  try {
    const board = await getBoard(boardId);
    return {
      title: board?.title || "Board",
    };
  } catch {
    return { title: "Board" };
  }
}

const BoardIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ boardId: string }>;
}) => {
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
  if (!board) notFound();

  return (
    <div
      style={{ backgroundImage: `url(${board.imageFullUrl})` }}
      className="relative h-full bg-no-repeat bg-cover bg-center"
    >
      <BoardNavbar data={board} />
      <div aria-hidden className="absolute inset-0 bg-black/10" />
      <main className="relative pt-28 h-full">{children}</main>
    </div>
  );
};

export default BoardIdLayout;
