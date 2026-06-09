"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { ToggleCardCompletion } from "./schema";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { getAdminDb } from "@/lib/firebase/admin";
import { getCard } from "@/lib/firebase/cards";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
  }

  const { id, boardId, isCompleted } = data;

  try {
    const card = await getCard(id);
    if (!card) {
      return { error: "Card not found" };
    }

    // Check RBAC
    let isAdmin = false;
    try {
      const { getUserRole } = await import("@/lib/firebase/workspaces");
      const role = await getUserRole(orgId, ctx.userId);
      isAdmin = role === "owner" || role === "admin";
    } catch {}

    const assignees = card.assignees || [];
    const allAssignees = [...assignees, card.assignedTo].filter(Boolean) as string[];
    const isAssigned = allAssignees.map(a => String(a).toLowerCase()).includes(String(ctx.user?.email || "").toLowerCase());

    if (!isAdmin && !isAssigned) {
      return { error: "Unauthorized - Must be an admin or assigned to this task" };
    }

    await getAdminDb().collection("cards").doc(id).update({
      isCompleted,
      updatedAt: new Date(),
    });

    // We skip the audit log here to keep it simple, or we could log it.
    
    revalidatePath(`/board/${boardId}`);
    return { data: { ...card, isCompleted } };
  } catch (error) {
    return { error: "Failed to toggle card completion" };
  }
};

export const toggleCardCompletion = createSafeAction(ToggleCardCompletion, handler);
