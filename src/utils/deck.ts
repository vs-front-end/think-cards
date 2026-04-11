import { db } from "@/lib/db";

type TreeNode = { name: string; children: TreeNode[] };

export const filterTree = <T extends TreeNode>(
  nodes: T[],
  query: string,
): T[] => {
  return nodes.reduce<T[]>((acc, node) => {
    const filteredChildren = filterTree(node.children, query) as T[];
    if (
      node.name.toLowerCase().includes(query) ||
      filteredChildren.length > 0
    ) {
      acc.push({ ...node, children: filteredChildren });
    }
    return acc;
  }, []);
};

export const getAllDescendantDeckIds = async (
  rootDeckId: string,
): Promise<string[]> => {
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
};
