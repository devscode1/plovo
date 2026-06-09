import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { AddWorkspaceMember } from "./schema";
import { WorkspaceMember } from "@/lib/firebase/workspaces";

export type InputType = z.infer<typeof AddWorkspaceMember>;
export type ReturnType = ActionState<InputType, WorkspaceMember>;
