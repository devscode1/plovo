"use server";

import { revalidatePath } from "next/cache";
import { CreateList } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { createList as createListDb } from "@/lib/firebase/lists";
import { getBoard } from "@/lib/firebase/boards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole } from "@/lib/firebase/workspaces";
import { getAdminDb } from "@/lib/firebase/admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { userId, orgId } = ctx;

  if (!orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, boardId } = data;

  try {
    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    const lastListSnapshot = await getAdminDb()
      .collection("lists")
      .where("boardId", "==", boardId)
      .orderBy("order", "desc")
      .limit(1)
      .get();

    const lastList = lastListSnapshot.docs[0]?.data() as { order?: number } | undefined;
    const newOrder = lastList ? lastList.order! + 1 : 1;

    const list = await createListDb({
      title,
      boardId,
      order: newOrder,
    });

    await createAuditLog(orgId, userId, {
      entityId: list.id,
      entityTitle: list.title,
      entityType: "LIST",
      action: "CREATE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    return { data: list };
  } catch (error) {
    console.error("createList action error:", error);
    return { error: `Failed to create list: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const createList = createSafeAction(CreateList, handler);
