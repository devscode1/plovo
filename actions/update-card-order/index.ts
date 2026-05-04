"use server";

import { revalidatePath } from "next/cache";
import { UpdateCardOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { updateCardOrder as updateCardOrderDb } from "@/lib/firebase/cards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
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
