import { db } from "@/lib/db";

export async function getAllDescendantDeckIds(
  rootDeckId: string,
): Promise<string[]> {
  const allDecks = await db.decks
    .filter((d) => d.deleted_at === null)
    .toArray();

  const childrenMap = new Map<string, string[]>();

  for (const deck of allDecks) {
    if (deck.parent_id) {
      const siblings = childrenMap.get(deck.parent_id) ?? [];

      siblings.push(deck.id);
      childrenMap.set(deck.parent_id, siblings);
    }
  }

  const result: string[] = [];
  const queue = [rootDeckId];

  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);

    const children = childrenMap.get(id) ?? [];
    queue.push(...children);
  }

  return result;
}
