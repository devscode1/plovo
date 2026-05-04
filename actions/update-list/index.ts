"use server";

import { revalidatePath } from "next/cache";
import { UpdateList } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { updateList as updateListDb, getList } from "@/lib/firebase/lists";
import { getBoard } from "@/lib/firebase/boards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { userId, orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
  }

  const { title, id, boardId } = data;

  try {
    const list = await getList(id);
    if (!list || list.boardId !== boardId) {
      return { error: "List not found" };
    }

    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    await updateListDb(id, { title });

    await createAuditLog(orgId, userId, {
      entityId: id,
      entityTitle: title,
      entityType: "LIST",
      action: "UPDATE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    return { data: { ...list, title } };
  } catch {
    return { error: "Failed to update." };
  }
};

export const updateList = createSafeAction(UpdateList, handler);
