import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import i18next from "i18next";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { State } from "ts-fsrs";
import type { CardType } from "@/lib/db";

export type CardStatus = "new" | "learning" | "review";

export type CardWithState = {
  id: string;
  deck_id: string;
  type: CardType;
  front: string;
  back: string;
  updated_at: string;
  status: CardStatus;
  due: string | null;
  state: number;
};

function toStatus(state: number): CardStatus {
  if (state === State.New) return "new";
  if (state === State.Learning || state === State.Relearning) return "learning";
  return "review";
}

export function useCardsWithState(deckId: string | null) {
  const result = useLiveQuery(async () => {
    if (!deckId) return [];

    const cards = await db.cards
      .where("deck_id")
      .equals(deckId)
      .filter((c) => c.deleted_at === null)
      .toArray();

    const cardIds = cards.map((c) => c.id);

    const states = await db.card_state
      .where("card_id")
      .anyOf(cardIds)
      .toArray();

    const stateMap = new Map(states.map((s) => [s.card_id, s]));

    return cards.map((c) => {
      const s = stateMap.get(c.id);
      return {
        id: c.id,
        deck_id: c.deck_id,
        type: c.type,
        front: c.front,
        back: c.back,
        updated_at: c.updated_at,
        status: s ? toStatus(s.state) : ("new" as CardStatus),
        due: s?.due ?? null,
        state: s?.state ?? State.New,
      };
    });
  }, [deckId]);

  return {
    data: result ?? [],
    isLoading: result === undefined,
  };
}

export function useMoveCards() {
  return useMutation({
    mutationFn: async ({
      cardIds,
      targetDeckId,
    }: {
      cardIds: string[];
      targetDeckId: string;
    }) => {
      const now = new Date().toISOString();

      await Promise.all(
        cardIds.map((id) =>
          db.cards.update(id, {
            deck_id: targetDeckId,
            updated_at: now,
            pending_sync: 1,
          }),
        ),
      );
      return cardIds;
    },

    onSuccess: (cardIds) => {
      toast.success(i18next.t("cardsMoved", { count: cardIds.length }));
    },

    onError: () => {
      toast.error(i18next.t("cardsMovedError"));
    },
  });
}

export function useBulkDeleteCards() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (cardIds: string[]) => {
      const now = new Date().toISOString();
      await Promise.all(
        cardIds.map((id) =>
          db.cards.update(id, {
            deleted_at: now,
            updated_at: now,
            pending_sync: 1,
          }),
        ),
      );
      return cardIds;
    },
    onSuccess: (cardIds) => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(i18next.t("cardsDeleted", { count: cardIds.length }));
    },
    onError: () => {
      toast.error(i18next.t("cardsDeletedError"));
    },
  });
}
