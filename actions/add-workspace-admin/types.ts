import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { AddWorkspaceAdmin } from "./schema";
import type { WorkspaceMember } from "@/lib/firebase/workspaces";

export type InputType = z.infer<typeof AddWorkspaceAdmin>;
export type ReturnType = ActionState<InputType, WorkspaceMember>;
