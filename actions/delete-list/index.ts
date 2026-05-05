"use server";

import { revalidatePath } from "next/cache";
import { DeleteList } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { deleteList as deleteListDb, getList } from "@/lib/firebase/lists";
import { getBoard } from "@/lib/firebase/boards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole } from "@/lib/firebase/workspaces";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { userId, orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
  }

  try {
    await requireAdminRole(orgId, ctx.userId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unauthorized - Admin access required" };
  }

  const { id, boardId } = data;

  try {
    const list = await getList(id);
    if (!list || list.boardId !== boardId) {
      return { error: "List not found" };
    }

    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    await createAuditLog(orgId, userId, {
      entityId: list.id,
      entityTitle: list.title,
      entityType: "LIST",
      action: "DELETE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    await deleteListDb(id);
    revalidatePath(`/board/${boardId}`);
    return { data: list };
  } catch {
    return { error: "Failed to delete." };
  }
};

export const deleteList = createSafeAction(DeleteList, handler);
