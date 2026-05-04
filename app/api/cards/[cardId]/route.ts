import { NextResponse } from "next/server";
import { getCard } from "@/lib/firebase/cards";
import { getList } from "@/lib/firebase/lists";
import { getBoard } from "@/lib/firebase/boards";
import { verifyAuth } from "@/lib/firebase/server-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const auth = await verifyAuth();
    if (!auth) return new NextResponse("Unauthorized", { status: 401 });

    const { cardId } = await params;

    const card = await getCard(cardId);
    if (!card) return new NextResponse("Card not found", { status: 404 });

    const list = await getList(card.listId);
    if (!list) return new NextResponse("List not found", { status: 404 });

    const board = await getBoard(list.boardId);
    if (!board) return new NextResponse("Board not found", { status: 404 });

    return NextResponse.json({ ...card, list: { title: list.title } });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
