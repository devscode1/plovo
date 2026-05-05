import { z } from "zod";

export const ToggleCardCompletion = z.object({
  id: z.string(),
  boardId: z.string(),
  isCompleted: z.boolean(),
});
