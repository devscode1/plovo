"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeleteBoard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/firebase/audit-log";
import { deleteBoard as deleteBoardDb, getBoard } from "@/lib/firebase/boards";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole } from "@/lib/firebase/workspaces";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { userId, orgId } = ctx;

  if (!orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { id } = data;

  try {
    const board = await getBoard(id);
    if (!board || board.orgId !== orgId) {
      return {
        error: "Board not found",
      };
    }

    await createAuditLog(orgId, userId, {
      entityId: board.id,
      entityTitle: board.title,
      entityType: "BOARD",
      action: "DELETE",
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
    });

    await deleteBoardDb(id);
  } catch {
    return {
      error: "Failed to delete.",
    };
  }

  revalidatePath(`/organization/${orgId}`);
  redirect(`/organization/${orgId}`);
};

export const deleteBoard = createSafeAction(DeleteBoard, handler);
