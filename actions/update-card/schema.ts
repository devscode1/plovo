import { z } from "zod";

export const UpdateCard = z.object({
  boardId: z.string(),
  description: z.optional(
    z
      .string({
        error: "Description is required.",
      })
      .min(1, { message: "Description is required." }),
  ),
  title: z.optional(
    z
      .string({
        error: "Title is required.",
      })
      .min(1, { message: "Title is required." }),
  ),
  id: z.string(),
});
