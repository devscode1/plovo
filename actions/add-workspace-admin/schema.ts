import { z } from "zod";

export const AddWorkspaceAdmin = z.object({
  email: z.string().email(),
});
