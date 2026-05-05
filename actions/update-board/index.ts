"use server";

import { revalidatePath } from "next/cache";
import { UpdateBoard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { updateBoard as updateBoardDb, getBoard } from "@/lib/firebase/boards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole } from "@/lib/firebase/workspaces";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { userId, orgId } = ctx;

  if (!orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, id } = data;

  try {
    const board = await getBoard(id);
    if (!board || board.orgId !== orgId) {
      return {
        error: "Board not found",
      };
    }

    await updateBoardDb(id, { title });

    await createAuditLog(orgId, userId, {
      entityId: id,
      entityTitle: title,
      entityType: "BOARD",
      action: "UPDATE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    revalidatePath(`/board/${id}`);
    revalidatePath(`/organization/${orgId}`);
    return { data: { ...board, title } };
  } catch {
    return {
      error: "Failed to update.",
    };
  }
};

export const updateBoard = createSafeAction(UpdateBoard, handler);
