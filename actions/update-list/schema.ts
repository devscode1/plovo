import { z } from "zod";

export const UpdateList = z.object({
  title: z
    .string({
      error: "Title is required.",
    })
    .min(1, { message: "Title is required." }),
  id: z.string(),
  boardId: z.string(),
});
