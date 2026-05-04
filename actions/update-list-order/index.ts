"use server";

import { revalidatePath } from "next/cache";
import { UpdateListOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { updateListOrder as updateListOrderDb } from "@/lib/firebase/lists";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
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
