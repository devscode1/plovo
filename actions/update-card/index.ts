"use server";

import { revalidatePath } from "next/cache";
import { UpdateCard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { updateCard as updateCardDb, getCard } from "@/lib/firebase/cards";
import { getList } from "@/lib/firebase/lists";
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

  const { id, boardId, ...values } = data;

  try {
    const card = await getCard(id);
    if (!card) {
      return { error: "Card not found" };
    }

    const list = await getList(card.listId);
    if (!list) {
      return { error: "List not found" };
    }

    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    await updateCardDb(id, values);

    await createAuditLog(orgId, userId, {
      entityId: id,
      entityTitle: values.title || card.title,
      entityType: "CARD",
      action: "UPDATE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    return { data: { ...card, ...values } };
  } catch {
    return { error: "Failed to update." };
  }
};

export const updateCard = createSafeAction(UpdateCard, handler);
