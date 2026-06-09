"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { DeleteWorkspace } from "./schema";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdminRole } from "@/lib/firebase/workspaces";
import { getBoards, deleteBoard } from "@/lib/firebase/boards";
import { redirect } from "next/navigation";

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

  if (orgId !== data.id) {
    return { error: "Organization ID mismatch" };
  }

  try {
    const db = getAdminDb();
    
    // 1. Delete all boards (which internally deletes lists and cards)
    const boards = await getBoards(orgId);
    for (const board of boards) {
      await deleteBoard(board.id);
    }

    // 2. Delete all members in the workspace
    const membersSnapshot = await db
      .collection("workspaces")
      .doc(orgId)
      .collection("members")
      .get();
      
    const batch = db.batch();
    membersSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 3. Delete the workspace document
    batch.delete(db.collection("workspaces").doc(orgId));
    
    await batch.commit();

  } catch (error) {
    console.error("deleteWorkspace action error:", error);
    return { error: `Failed to delete workspace: ${error instanceof Error ? error.message : String(error)}` };
  }

  // Redirect to workspace selection
  revalidatePath("/select-workspace");
  revalidatePath(`/organization/${orgId}`);
  redirect("/select-workspace");
};

export const deleteWorkspace = createSafeAction(DeleteWorkspace, handler);
