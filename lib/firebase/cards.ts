import { getAdminDb } from "@/lib/firebase/admin";

export interface Card {
  id: string;
  title: string;
  order: number;
  description: string | null;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createCard(data: Omit<Card, "id" | "createdAt" | "updatedAt">): Promise<Card> {
  const cardData = {
    ...data,
    description: data.description || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const cardRef = await getAdminDb().collection("cards").add(cardData);
  return { id: cardRef.id, ...cardData };
}

export async function getCards(listId: string): Promise<Card[]> {
  const snapshot = await getAdminDb()
    .collection("cards")
    .where("listId", "==", listId)
    .orderBy("order", "asc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Card[];
}

export async function getCard(cardId: string): Promise<Card | null> {
  const doc = await getAdminDb().collection("cards").doc(cardId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Card;
}

export async function updateCard(cardId: string, data: Partial<Card>): Promise<void> {
  await getAdminDb().collection("cards").doc(cardId).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteCard(cardId: string): Promise<void> {
  await getAdminDb().collection("cards").doc(cardId).delete();
}

export async function updateCardOrder(
  items: { id: string; order: number; listId: string }[]
): Promise<void> {
  const batch = getAdminDb().batch();

  for (const item of items) {
    const ref = getAdminDb().collection("cards").doc(item.id);
    batch.update(ref, { order: item.order, listId: item.listId, updatedAt: new Date() });
  }

  await batch.commit();
}
