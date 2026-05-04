"use server";

import { revalidatePath } from "next/cache";
import { CopyList } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { createList as createListDb, getList } from "@/lib/firebase/lists";
import { createCard, getCards } from "@/lib/firebase/cards";
import { getBoard } from "@/lib/firebase/boards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { adminDb } from "@/lib/firebase/admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { userId, orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
  }

  const { id, boardId } = data;

  try {
    const listToCopy = await getList(id);
    if (!listToCopy || listToCopy.boardId !== boardId) {
      return { error: "List not found." };
    }

    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    const lastListSnapshot = await adminDb
      .collection("lists")
      .where("boardId", "==", boardId)
      .orderBy("order", "desc")
      .limit(1)
      .get();

    const lastList = lastListSnapshot.docs[0]?.data() as { order?: number } | undefined;
    const newOrder = lastList ? lastList.order! + 1 : 1;

    const list = await createListDb({
      title: `${listToCopy.title} — Copy`,
      boardId,
      order: newOrder,
    });

    const cards = await getCards(id);
    for (const card of cards) {
      await createCard({
        title: card.title,
        description: card.description,
        order: card.order,
        listId: list.id,
      });
    }

    await createAuditLog(orgId, userId, {
      entityId: list.id,
      entityTitle: list.title,
      entityType: "LIST",
      action: "CREATE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    return { data: list };
  } catch {
    return { error: "Failed to copy." };
  }
};

export const copyList = createSafeAction(CopyList, handler);
