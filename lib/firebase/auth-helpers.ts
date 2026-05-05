import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { getActiveOrgId, verifyAuth } from "@/lib/firebase/server-auth";

export async function getAuthContext() {
  const authResult = await verifyAuth();

  if ("error" in authResult) {
    return { userId: null, orgId: null, user: null, error: authResult.error };
  }

  const userDoc = await getAdminDb().collection("users").doc(authResult.userId).get();
  const user = userDoc.exists ? userDoc.data() : null;

  const orgId = await getActiveOrgId();

  return { userId: authResult.userId, orgId, user, error: null };
}

export async function requireAuthContext() {
  const ctx = await getAuthContext();

  if (!ctx.userId) {
    throw new Error(ctx.error || "Unauthorized - Auth verification failed");
  }

  return ctx as { userId: string; orgId: string | null; user: Record<string, unknown> | null };
}
