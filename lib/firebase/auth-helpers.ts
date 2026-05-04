import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { getActiveOrgId, verifyAuth } from "@/lib/firebase/server-auth";

export async function getAuthContext() {
  const auth = await verifyAuth();

  if (!auth) {
    return { userId: null, orgId: null, user: null };
  }

  const userDoc = await adminDb.collection("users").doc(auth.userId).get();
  const user = userDoc.exists ? userDoc.data() : null;

  const orgId = await getActiveOrgId();

  return { userId: auth.userId, orgId, user };
}

export async function requireAuthContext() {
  const ctx = await getAuthContext();

  if (!ctx.userId) {
    throw new Error("Unauthorized");
  }

  return ctx as { userId: string; orgId: string | null; user: Record<string, unknown> | null };
}
