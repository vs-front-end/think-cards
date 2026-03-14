import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import i18next from "i18next";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { useAuthStore } from "@/store";
import type { IDeck } from "@/lib/db";

export type DeckNode = IDeck & { children: DeckNode[] };

function buildTree(decks: IDeck[]): DeckNode[] {
  const map = new Map<string, DeckNode>();
  for (const d of decks) map.set(d.id, { ...d, children: [] });

  const roots: DeckNode[] = [];

  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function useDecks() {
  const decks = useLiveQuery(
    () => db.decks.filter((d) => d.deleted_at === null).toArray(),
    [],
  );

  return {
    data: decks ? buildTree(decks) : undefined,
    isLoading: decks === undefined,
  };
}

export function useDecksList() {
  const decks = useLiveQuery(
    () => db.decks.filter((d) => d.deleted_at === null).toArray(),
    [],
  );

  return {
    data: decks ?? [],
    isLoading: decks === undefined,
  };
}

export function useCreateDeck() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      parent_id: string | null;
      daily_goal: number;
    }) => {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error("Not authenticated");

      const now = new Date().toISOString();

      const deck: IDeck = {
        id: crypto.randomUUID(),
        user_id: userId,
        name: input.name,
        parent_id: input.parent_id,
        daily_goal: input.daily_goal,
        created_at: now,
        updated_at: now,
        pending_sync: true,
        deleted_at: null,
      };

      await db.decks.add(deck);
      return deck;
    },

    onSuccess: (deck) => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(i18next.t("deckCreated", { name: deck.name }));
    },

    onError: () => {
      toast.error(i18next.t("deckCreatedError"));
    },
  });
}

export function useUpdateDeck() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      parent_id: string | null;
      daily_goal: number;
    }) => {
      const now = new Date().toISOString();

      await db.decks.update(input.id, {
        name: input.name,
        parent_id: input.parent_id,
        daily_goal: input.daily_goal,
        updated_at: now,
        pending_sync: true,
      });

      return input;
    },

    onSuccess: (input) => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(i18next.t("deckUpdated", { name: input.name }));
    },

    onError: () => {
      toast.error(i18next.t("deckUpdatedError"));
    },
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (deckId: string) => {
      const now = new Date().toISOString();

      await db.decks.update(deckId, {
        deleted_at: now,
        updated_at: now,
        pending_sync: true,
      });

      const childCards = await db.cards
        .where("deck_id")
        .equals(deckId)
        .toArray();

      await Promise.all(
        childCards.map((c) =>
          db.cards.update(c.id, {
            deleted_at: now,
            updated_at: now,
            pending_sync: true,
          }),
        ),
      );
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(i18next.t("deckDeleted"));
    },

    onError: () => {
      toast.error(i18next.t("deckDeletedError"));
    },
  });
}
