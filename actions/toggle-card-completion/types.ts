import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { ToggleCardCompletion } from "./schema";
import type { Card } from "@/lib/firebase/cards";

export type InputType = z.infer<typeof ToggleCardCompletion>;
export type ReturnType = ActionState<InputType, Card>;
