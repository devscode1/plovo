import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function verifyAuth(): Promise<{ userId: string; email?: string; token: DecodedIdToken } | { error: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__session")?.value;

    if (!token) {
      return { error: "No __session cookie found in request" };
    }

    const decodedToken = await getAdminAuth().verifyIdToken(token);
    return { userId: decodedToken.uid, email: decodedToken.email, token: decodedToken };
  } catch (error) {
    console.error("verifyAuth failed:", error);
    return { error: `Auth verification failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function getActiveOrgId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("activeOrgId")?.value || null;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const auth = await verifyAuth();
  if (!auth) {
    throw new Error("Unauthorized");
  }
  return auth;
}
