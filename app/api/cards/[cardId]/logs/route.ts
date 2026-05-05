import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAuth } from "@/lib/firebase/server-auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const auth = await verifyAuth();
    if (!auth) return new NextResponse("Unauthorized", { status: 401 });

    const { cardId } = await params;

    const auditLogsSnapshot = await getAdminDb()
      .collection("auditLogs")
      .where("entityId", "==", cardId)
      .where("entityType", "==", "CARD")
      .orderBy("createdAt", "desc")
      .limit(3)
      .get();

    const auditLogs = auditLogsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(auditLogs);
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
