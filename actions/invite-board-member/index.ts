"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { InviteBoardMember } from "./schema";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { getAdminDb } from "@/lib/firebase/admin";
import { getBoard } from "@/lib/firebase/boards";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
  }

  const { email, boardId } = data;

  try {
    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    const members = board.members || [];
    if (!members.includes(email)) {
      members.push(email);
      await getAdminDb().collection("boards").doc(boardId).update({
        members,
        updatedAt: new Date(),
      });
    }

    revalidatePath(`/board/${boardId}`);
    return { data: { success: true } };
  } catch (error) {
    console.error("inviteBoardMember action error:", error);
    return { error: `Failed to invite member: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const inviteBoardMember = createSafeAction(InviteBoardMember, handler);
