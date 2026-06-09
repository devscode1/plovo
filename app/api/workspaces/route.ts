import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { convertTimestamps } from "@/lib/firebase/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAuth();
    if ("error" in auth) {
      return new NextResponse(auth.error, { status: 401 });
    }

    const { userId } = auth;
    const db = getAdminDb();

    const [memberSnap, ownedSnap] = await Promise.all([
      db.collectionGroup("members").where("userId", "==", userId).get(),
      db.collection("workspaces").where("ownerId", "==", userId).get()
    ]);

    const workspacesMap = new Map<string, any>();

    // Add owned workspaces first (role = owner)
    ownedSnap.docs.forEach((doc) => {
      workspacesMap.set(doc.id, convertTimestamps({
        id: doc.id,
        ...doc.data(),
        role: "owner"
      }));
    });

    // Add workspaces from members subcollections
    const memberPromises = memberSnap.docs.map(async (memberDoc) => {
      const { workspaceId, role } = memberDoc.data();
      if (workspacesMap.has(workspaceId)) {
        // If already added from ownedSnap, maybe update role if it's somehow different
        // but owner usually takes precedence.
        return null;
      }
      
      const workspaceSnap = await db.collection("workspaces").doc(workspaceId).get();
      if (!workspaceSnap.exists) return null;
      
      const wsData = convertTimestamps({
        id: workspaceSnap.id,
        ...workspaceSnap.data(),
        role: role || "member", // Default to member if role is missing
      });
      workspacesMap.set(workspaceId, wsData);
      return wsData;
    });

    await Promise.all(memberPromises);

    const workspaces = Array.from(workspacesMap.values());
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("GET /api/workspaces error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
