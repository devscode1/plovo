import type { Card } from "@/lib/firebase/cards";
import type { List } from "@/lib/firebase/lists";

export type ListWithCards = List & { cards: Card[] };
export type CardWithList = Card & { list: List };
