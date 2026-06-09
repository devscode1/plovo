import { z } from "zod";

export const AddWorkspaceMember = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});
