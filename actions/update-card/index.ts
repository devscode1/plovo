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
import { requireAdminRole, getUserRole } from "@/lib/firebase/workspaces";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { userId, orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
  }

  const { id, boardId, ...values } = data;

  try {
    const card = await getCard(id);
    if (!card) {
      return { error: "Card not found" };
    }

    let isAuthorized = false;
    try {
      await requireAdminRole(orgId, ctx.userId);
      isAuthorized = true;
    } catch {
      // If not an admin, check if member and assigned to this card
      const role = await getUserRole(orgId, ctx.userId);
      const userEmail = ctx.user?.email as string | undefined;
      if (role === "member" && card.assignedTo && userEmail && (card.assignedTo as string).toLowerCase() === userEmail.toLowerCase()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return { error: "Unauthorized - You can only edit your assigned tasks" };
    }



    const list = await getList(card.listId);
    if (!list) {
      return { error: "List not found" };
    }

    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    const updateData: any = { ...values };
    
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }
    
    if (updateData.isCompleted && !card.isCompleted) {
      updateData.completedAt = new Date();
    } else if (updateData.isCompleted === false) {
      updateData.completedAt = null;
    }

    await updateCardDb(id, updateData);

    await createAuditLog(orgId, userId, {
      entityId: id,
      entityTitle: values.title || card.title,
      entityType: "CARD",
      action: "UPDATE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    revalidatePath(`/board/${boardId}`);
    return { data: { ...card, ...updateData } };
  } catch {
    return { error: "Failed to update." };
  }
};

export const updateCard = createSafeAction(UpdateCard, handler);
