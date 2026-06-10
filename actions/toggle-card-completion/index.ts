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
    const userEmail = ctx.user?.email as string | undefined;
    const isAssigned = allAssignees.map(a => String(a).toLowerCase()).includes(String(userEmail || "").toLowerCase());

    if (!isAdmin && !isAssigned) {
      return { error: "Unauthorized - Must be an admin or assigned to this task" };
    }

    if (!userEmail) {
      return { error: "User email not found" };
    }

    const completedBy: string[] = card.completedBy || [];
    let newCompletedBy = [...completedBy];

    if (isCompleted) {
      if (!newCompletedBy.map(e => e.toLowerCase()).includes(userEmail.toLowerCase())) {
        newCompletedBy.push(userEmail);
      }
    } else {
      newCompletedBy = newCompletedBy.filter(email => email.toLowerCase() !== userEmail.toLowerCase());
    }

    // A card is globally "isCompleted" only if all assignees have completed it.
    // If no assignees, we use the value passed (admins can toggle it).
    let allCompleted = isCompleted;
    if (allAssignees.length > 0) {
      allCompleted = allAssignees.every(email => 
        newCompletedBy.map(e => e.toLowerCase()).includes(email.toLowerCase())
      );
    }

    const updateData: any = {
      completedBy: newCompletedBy,
      isCompleted: allCompleted,
      updatedAt: new Date(),
    };

    if (allCompleted && !card.isCompleted) {
      updateData.completedAt = new Date();
    } else if (!allCompleted && card.isCompleted) {
      updateData.completedAt = null;
    }

    await getAdminDb().collection("cards").doc(id).update(updateData);

    revalidatePath(`/board/${boardId}`);
    return { data: { ...card, ...updateData } };
  } catch (error) {
    return { error: "Failed to toggle card completion" };
  }
};

export const toggleCardCompletion = createSafeAction(ToggleCardCompletion, handler);
