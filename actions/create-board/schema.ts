import { z } from "zod";

export const CreateBoard = z.object({
  title: z
    .string({
      error: "Title is required.",
    })
    .min(1, { message: "Title is required." }),
  image: z.string({
    error: "Image is required.",
  }),
});
