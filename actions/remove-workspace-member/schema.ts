import { z } from "zod";

export const RemoveWorkspaceMember = z.object({
  memberId: z.string({
    required_error: "Member ID is required",
    invalid_type_error: "Member ID is required",
  }),
});
