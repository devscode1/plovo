import { z } from "zod";

export const CreateCard = z.object({
  title: z
    .string({
      error: "Title is required.",
    })
    .min(1, { message: "Title is required." }),
  boardId: z.string(),
  listId: z.string(),
});
