import { NextResponse } from "next/server";
import { getBoard } from "@/lib/firebase/boards";
import { getAuthContext } from "@/lib/firebase/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const ctx = await getAuthContext();
    const { boardId } = await params;

    if (!ctx.user) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirectUrl", `/api/invite/${boardId}`);
      return NextResponse.redirect(signInUrl);
    }

    const board = await getBoard(boardId);
    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    const userEmail = ctx.user.email as string | undefined;
    const hasAccess =
      (userEmail && board.members?.includes(userEmail)) ||
      board.orgId === ctx.orgId;

    if (!hasAccess) {
      return new NextResponse("You do not have access to this board.", {
        status: 403,
      });
    }

    // Redirect to the board and set the orgId cookie
    const response = NextResponse.redirect(new URL(`/board/${boardId}`, req.url));
    response.cookies.set("activeOrgId", board.orgId, {
      path: "/",
      maxAge: 31536000,
    });

    return response;
  } catch (error) {
    console.error("Invite route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
