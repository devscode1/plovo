"use server";

import { revalidatePath } from "next/cache";
import { CopyCard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { createCard, getCard } from "@/lib/firebase/cards";
import { getList } from "@/lib/firebase/lists";
import { getBoard } from "@/lib/firebase/boards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole } from "@/lib/firebase/workspaces";
import { getAdminDb } from "@/lib/firebase/admin";

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
    const cardToCopy = await getCard(id);
    if (!cardToCopy) {
      return { error: "Card not found." };
    }

    const list = await getList(cardToCopy.listId);
    if (!list) {
      return { error: "List not found" };
    }

    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    const lastCardSnapshot = await getAdminDb()
      .collection("cards")
      .where("listId", "==", cardToCopy.listId)
      .orderBy("order", "desc")
      .limit(1)
      .get();

    const lastCard = lastCardSnapshot.docs[0]?.data() as { order?: number } | undefined;
    const newOrder = lastCard ? lastCard.order! + 1 : 1;

    const card = await createCard({
      title: `${cardToCopy.title} — Copy`,
      description: cardToCopy.description,
      order: newOrder,
      listId: cardToCopy.listId,
    });

    await createAuditLog(orgId, userId, {
      entityId: card.id,
      entityTitle: card.title,
      entityType: "CARD",
      action: "CREATE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    revalidatePath(`/board/${boardId}`);
    return { data: card };
  } catch {
    return { error: "Failed to copy." };
  }
};

export const copyCard = createSafeAction(CopyCard, handler);
