import { adminDb } from "@/lib/firebase/admin";

export interface Board {
  id: string;
  orgId: string;
  title: string;
  imageId: string;
  imageThumbUrl: string;
  imageFullUrl: string;
  imageUserName: string;
  imageLinkHtml: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createBoard(data: Omit<Board, "id" | "createdAt" | "updatedAt">): Promise<Board> {
  const boardData = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const boardRef = await adminDb.collection("boards").add(boardData);
  return { id: boardRef.id, ...boardData };
}

export async function getBoards(orgId: string): Promise<Board[]> {
  const snapshot = await adminDb
    .collection("boards")
    .where("orgId", "==", orgId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Board[];
}

export async function getBoard(boardId: string): Promise<Board | null> {
  const doc = await adminDb.collection("boards").doc(boardId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Board;
}

export async function updateBoard(boardId: string, data: Partial<Board>): Promise<void> {
  await adminDb.collection("boards").doc(boardId).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteBoard(boardId: string): Promise<void> {
  const listsSnapshot = await adminDb
    .collection("lists")
    .where("boardId", "==", boardId)
    .get();

  const batch = adminDb.batch();

  for (const listDoc of listsSnapshot.docs) {
    const cardsSnapshot = await adminDb
      .collection("cards")
      .where("listId", "==", listDoc.id)
      .get();

    for (const cardDoc of cardsSnapshot.docs) {
      batch.delete(cardDoc.ref);
    }

    batch.delete(listDoc.ref);
  }

  batch.delete(adminDb.collection("boards").doc(boardId));
  await batch.commit();
}
