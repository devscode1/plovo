"use server";

import { revalidatePath } from "next/cache";
import { UpdateCardOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { updateCardOrder as updateCardOrderDb } from "@/lib/firebase/cards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole } from "@/lib/firebase/workspaces";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
  }

  try {
    await requireAdminRole(orgId, ctx.userId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unauthorized - Admin access required" };
  }

  const { items, boardId } = data;

  try {
    await updateCardOrderDb(items);
    revalidatePath(`/board/${boardId}`);
    return { data: undefined };
  } catch {
    return { error: "Failed to update." };
  }
};

export const updateCardOrder = createSafeAction(UpdateCardOrder, handler);
