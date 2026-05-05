import { getAdminDb } from "@/lib/firebase/admin";
import { requireAuthContext } from "@/lib/firebase/auth-helpers";

type ActionType = "CREATE" | "UPDATE" | "DELETE";
type EntityType = "BOARD" | "LIST" | "CARD";

type Props = {
  entityId: string;
  entityType: EntityType;
  entityTitle: string;
  action: ActionType;
};

export const createAuditLog = async (props: Props) => {
  try {
    const ctx = await requireAuthContext();
    const { userId, orgId } = ctx;

    if (!orgId) throw new Error("No active workspace.");

    const { entityId, entityType, entityTitle, action } = props;

    await getAdminDb().collection("auditLogs").add({
      orgId,
      entityId,
      entityType,
      entityTitle,
      action,
      userId,
      userImage: (ctx.user?.photoURL as string) || "",
      userName: (ctx.user?.displayName as string) || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.log(`[AUDIT_LOG_ERROR]`, error);
  }
};
