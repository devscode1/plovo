import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { getBoard } from "@/lib/firebase/boards";
import { getWorkspaceMembers, isWorkspaceMember } from "@/lib/firebase/workspaces";

export async function GET(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const auth = await verifyAuth();
    if ("error" in auth) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = auth;
    const { boardId } = params;

    const board = await getBoard(boardId);
    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    const isMember = await isWorkspaceMember(board.orgId, userId);
    if (!isMember) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const members = await getWorkspaceMembers(board.orgId);

    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch board members:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
