"use server";

import { revalidatePath } from "next/cache";
import { UpdateListOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { updateListOrder as updateListOrderDb } from "@/lib/firebase/lists";
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
    await updateListOrderDb(items);
    revalidatePath(`/board/${boardId}`);
    return { data: undefined };
  } catch {
    return { error: "Failed to update." };
  }
};

export const updateListOrder = createSafeAction(UpdateListOrder, handler);
