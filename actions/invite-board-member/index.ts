"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { InviteBoardMember } from "./schema";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole } from "@/lib/firebase/workspaces";
import { getAdminDb } from "@/lib/firebase/admin";
import { getBoard } from "@/lib/firebase/boards";
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const boardUrl = `${appUrl}/api/invite/${boardId}`;

    // Send email to the invited user
    await sendEmail({
      to: email,
      subject: `You have been invited to a board: ${board.title}`,
      html: `
        <h2>You've been invited!</h2>
        <p><strong>${ctx.user?.displayName || "Someone"}</strong> has invited you to collaborate on the board: <strong>${board.title}</strong></p>
        <br />
        <a href="${boardUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0079bf; color: white; text-decoration: none; border-radius: 5px;">View Board on Plovo</a>
        <br /><br />
        <p>If you don't have an account yet, clicking the link will prompt you to create one first!</p>
      `,
    });

    revalidatePath(`/board/${boardId}`);
    return { data: { success: true } };
  } catch (error) {
    console.error("inviteBoardMember action error:", error);
    return { error: `Failed to invite member: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const inviteBoardMember = createSafeAction(InviteBoardMember, handler);
