import { adminDb } from "@/lib/firebase/admin";

export type ActionType = "CREATE" | "UPDATE" | "DELETE";
export type EntityType = "BOARD" | "LIST" | "CARD";

export interface AuditLog {
  id: string;
  orgId: string;
  action: ActionType;
  entityId: string;
  entityType: EntityType;
  entityTitle: string;
  userId: string;
  userImage: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createAuditLog(
  orgId: string,
  userId: string,
  data: {
    entityId: string;
    entityTitle: string;
    entityType: EntityType;
    action: ActionType;
    userImage: string;
    userName: string;
  }
): Promise<void> {
  await adminDb.collection("auditLogs").add({
    orgId,
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function getAuditLogs(orgId: string): Promise<AuditLog[]> {
  const snapshot = await adminDb
    .collection("auditLogs")
    .where("orgId", "==", orgId)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AuditLog[];
}
