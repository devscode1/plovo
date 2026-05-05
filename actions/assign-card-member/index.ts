"use server";

import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { AssignCardMember } from "./schema";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";
import { getAdminDb } from "@/lib/firebase/admin";
import { getCard } from "@/lib/firebase/cards";
import { getBoard } from "@/lib/firebase/boards";
import { sendEmail } from "@/lib/mail";

const handler = async (data: InputType): Promise<ReturnType> => {
  const ctx = await requireAuthContext();
  const { orgId } = ctx;

  if (!orgId) {
    return { error: "Unauthorized" };
  }

  const { email, boardId, cardId } = data;

  try {
    const board = await getBoard(boardId);
    if (!board || board.orgId !== orgId) {
      return { error: "Board not found" };
    }

    const card = await getCard(cardId);
    if (!card) {
      return { error: "Card not found" };
    }

    // Update card with assignedTo email
    await getAdminDb().collection("cards").doc(cardId).update({
      assignedTo: email,
      updatedAt: new Date(),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const boardUrl = `${appUrl}/board/${boardId}`;

    // Send email to the assigned user
    await sendEmail({
      to: email,
      subject: `You have been assigned to a task: ${card.title}`,
      html: `
        <h2>You have a new task assigned to you!</h2>
        <p><strong>Board:</strong> ${board.title}</p>
        <p><strong>Task:</strong> ${card.title}</p>
        <br />
        <a href="${boardUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0079bf; color: white; text-decoration: none; border-radius: 5px;">View Task on Plovo</a>
        <br /><br />
        <p>If you don't have an account yet, clicking the link will prompt you to create one first!</p>
      `,
    });

    revalidatePath(`/board/${boardId}`);
    return { data: { success: true } };
  } catch (error) {
    console.error("assignCardMember action error:", error);
    return { error: `Failed to assign card: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const assignCardMember = createSafeAction(AssignCardMember, handler);
