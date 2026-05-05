import { z } from "zod";

export const InviteBoardMember = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  boardId: z.string(),
});
