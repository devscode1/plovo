import { z } from "zod";

export const AssignCardMember = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  boardId: z.string(),
  cardId: z.string(),
});
