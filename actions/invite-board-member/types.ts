import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { InviteBoardMember } from "./schema";

export type InputType = z.infer<typeof InviteBoardMember>;
export type ReturnType = ActionState<InputType, { success: boolean }>;
