"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "@/actions/create-board/types";
import { CreateBoard } from "@/actions/create-board/schema";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { createBoard as createBoardDb } from "@/lib/firebase/boards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { userId, orgId } = ctx;

  if (!orgId) {
    return {
      error: "Missing orgId. Please select a workspace.",
    };
  }

  const { title, image } = data;

  const [imageId, imageThumbUrl, imageFullUrl, imageLinkHtml, imageUserName] =
    image.split("|");

  if (
    !imageId ||
    !imageThumbUrl ||
    !imageFullUrl ||
    !imageLinkHtml ||
    !imageUserName
  ) {
    return {
      error: "Missing fields. Failed to create board.",
    };
  }

  let board;

  try {
    board = await createBoardDb({
      title,
      orgId,
      imageId,
      imageThumbUrl,
      imageFullUrl,
      imageUserName,
      imageLinkHtml,
    });

    await createAuditLog(orgId, userId, {
      entityId: board.id,
      entityTitle: board.title,
      entityType: "BOARD",
      action: "CREATE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });
  } catch (error) {
    console.error("createBoard action error:", error);
    return {
      error: `Failed to create board: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  revalidatePath(`/board/${board.id}`);
  return { data: board };
};

export const createBoard = createSafeAction(CreateBoard, handler);
