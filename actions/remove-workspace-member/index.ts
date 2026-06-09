"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { RemoveWorkspaceMember } from "./schema";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { getAdminDb } from "@/lib/firebase/admin";
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

  const { memberId } = data;

  try {
    const docRef = getAdminDb()
      .collection("workspaces")
      .doc(orgId)
      .collection("members")
      .doc(memberId);
      
    const memberDoc = await docRef.get();
    if (!memberDoc.exists) {
      return { error: "Member not found" };
    }
    
    if (memberDoc.data()?.role === "owner") {
      return { error: "Cannot remove the owner of the workspace." };
    }
    
    if (memberDoc.data()?.userId === ctx.userId) {
      return { error: "Cannot remove yourself." };
    }

    await docRef.delete();

    revalidatePath(`/organization/${orgId}/settings`);
    return { data: { success: true } };
  } catch (error) {
    console.error("removeWorkspaceMember action error:", error);
    return { error: `Failed to remove member: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const removeWorkspaceMember = createSafeAction(RemoveWorkspaceMember, handler);
