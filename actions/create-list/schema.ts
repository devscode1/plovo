import { z } from "zod";

export const CreateList = z.object({
  title: z
    .string({
      error: "Title is required.",
    })
    .min(1, { message: "Title is required." }),
  boardId: z.string(),
});
