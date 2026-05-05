import { getAdminDb } from "@/lib/firebase/admin";
import { convertTimestamps } from "@/lib/firebase/utils";

export interface Board {
  id: string;
  orgId: string;
  title: string;
  imageId: string;
  imageThumbUrl: string;
  imageFullUrl: string;
  imageUserName: string;
  imageLinkHtml: string;
  members?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function createBoard(data: Omit<Board, "id" | "createdAt" | "updatedAt">): Promise<Board> {
  const boardData = {
    ...data,
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const boardRef = await getAdminDb().collection("boards").add(boardData);
  return { id: boardRef.id, ...boardData };
}

export async function getBoards(orgId: string): Promise<Board[]> {
  const snapshot = await getAdminDb()
    .collection("boards")
    .where("orgId", "==", orgId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => convertTimestamps<Board>({ id: doc.id, ...doc.data() }));
}

export async function getBoard(boardId: string): Promise<Board | null> {
  const doc = await getAdminDb().collection("boards").doc(boardId).get();
  if (!doc.exists) return null;
  return convertTimestamps<Board>({ id: doc.id, ...doc.data() });
}

export async function updateBoard(boardId: string, data: Partial<Board>): Promise<void> {
  await getAdminDb().collection("boards").doc(boardId).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteBoard(boardId: string): Promise<void> {
  const listsSnapshot = await getAdminDb()
    .collection("lists")
    .where("boardId", "==", boardId)
    .get();

  const batch = getAdminDb().batch();

  for (const listDoc of listsSnapshot.docs) {
    const cardsSnapshot = await getAdminDb()
      .collection("cards")
      .where("listId", "==", listDoc.id)
      .get();

    for (const cardDoc of cardsSnapshot.docs) {
      batch.delete(cardDoc.ref);
    }

    batch.delete(listDoc.ref);
  }

  batch.delete(getAdminDb().collection("boards").doc(boardId));
  await batch.commit();
}
