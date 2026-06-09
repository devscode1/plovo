import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { RemoveWorkspaceMember } from "./schema";

export type InputType = z.infer<typeof RemoveWorkspaceMember>;
export type ReturnType = ActionState<InputType, { success: boolean }>;
