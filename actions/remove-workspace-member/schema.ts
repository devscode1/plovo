import { z } from "zod";

export const RemoveWorkspaceMember = z.object({
  memberId: z.string({
    error: "Member ID is required",
  }),
});
