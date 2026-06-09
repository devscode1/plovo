"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { AddWorkspaceAdmin } from "./schema";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import { requireAdminRole, WorkspaceMember } from "@/lib/firebase/workspaces";
import { sendEmail } from "@/lib/mail";

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

  const { email } = data;

  try {
    // 1. Get the user's ID by email
    let targetUser;
    try {
      targetUser = await getAdminAuth().getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return { error: "User not found. They must sign up to Plovo first before you can make them an admin." };
      }
      throw error;
    }

    const targetUserId = targetUser.uid;

    // 2. Check if they are already a member
    const existingMemberSnapshot = await getAdminDb()
      .collection("workspaces")
      .doc(orgId)
      .collection("members")
      .where("userId", "==", targetUserId)
      .limit(1)
      .get();

    if (!existingMemberSnapshot.empty) {
      const doc = existingMemberSnapshot.docs[0];
      const role = doc.data().role;
      if (role === "admin" || role === "owner") {
        return { error: "User is already an admin or owner of this workspace." };
      }

      // Upgrade to admin
      await doc.ref.update({ role: "admin" });
      
      try {
        await sendEmail({
          to: targetUser.email!,
          subject: "You have been made an Admin",
          html: `<p>Hello ${targetUser.displayName || targetUser.email},</p><p>You have been upgraded to an <strong>Admin</strong> in the Plovo workspace. You can now manage settings and view all activity.</p>`,
        });
      } catch (err) {
        console.error("Failed to send admin upgrade email", err);
      }
      
      revalidatePath(`/organization/${orgId}/settings`);
      return { data: { id: doc.id, ...doc.data(), role: "admin" } as unknown as WorkspaceMember };
    }

    // 3. Add as a new admin member
    const newMemberData = {
      workspaceId: orgId,
      userId: targetUserId,
      email: targetUser.email,
      displayName: targetUser.displayName || targetUser.email?.split("@")[0] || "Unknown",
      photoURL: targetUser.photoURL || null,
      role: "admin",
      createdAt: new Date(),
    };

    const docRef = await getAdminDb()
      .collection("workspaces")
      .doc(orgId)
      .collection("members")
      .add(newMemberData);

    try {
      await sendEmail({
        to: targetUser.email!,
        subject: "You have been made an Admin",
        html: `<p>Hello ${targetUser.displayName || targetUser.email},</p><p>You have been added as an <strong>Admin</strong> to a Plovo workspace. You can now manage settings and view all activity.</p>`,
      });
    } catch (err) {
      console.error("Failed to send admin invite email", err);
    }

    revalidatePath(`/organization/${orgId}/settings`);
    return { data: { id: docRef.id, ...newMemberData } as unknown as WorkspaceMember };
  } catch (error) {
    console.error("addWorkspaceAdmin action error:", error);
    return { error: `Failed to add admin: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const addWorkspaceAdmin = createSafeAction(AddWorkspaceAdmin, handler);
