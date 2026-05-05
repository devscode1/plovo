import { getAdminDb } from "@/lib/firebase/admin";

export interface List {
  id: string;
  title: string;
  order: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createList(data: Omit<List, "id" | "createdAt" | "updatedAt">): Promise<List> {
  const listData = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const listRef = await getAdminDb().collection("lists").add(listData);
  return { id: listRef.id, ...listData };
}

export async function getLists(boardId: string): Promise<List[]> {
  const snapshot = await getAdminDb()
    .collection("lists")
    .where("boardId", "==", boardId)
    .orderBy("order", "asc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as List[];
}

export async function getList(listId: string): Promise<List | null> {
  const doc = await getAdminDb().collection("lists").doc(listId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as List;
}

export async function updateList(listId: string, data: Partial<List>): Promise<void> {
  await getAdminDb().collection("lists").doc(listId).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteList(listId: string): Promise<void> {
  const cardsSnapshot = await getAdminDb()
    .collection("cards")
    .where("listId", "==", listId)
    .get();

  const batch = getAdminDb().batch();

  for (const cardDoc of cardsSnapshot.docs) {
    batch.delete(cardDoc.ref);
  }

  batch.delete(getAdminDb().collection("lists").doc(listId));
  await batch.commit();
}

export async function updateListOrder(
  items: { id: string; order: number }[]
): Promise<void> {
  const batch = getAdminDb().batch();

  for (const item of items) {
    const ref = getAdminDb().collection("lists").doc(item.id);
    batch.update(ref, { order: item.order, updatedAt: new Date() });
  }

  await batch.commit();
}
