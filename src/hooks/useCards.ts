import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import i18next from "i18next";
import { toast } from "sonner";
import { createEmptyCard } from "ts-fsrs";
import { db } from "@/lib/db";
import type { ICard, ICardState, CardType } from "@/lib/db";

export function useCards(deckId: string) {
  const cards = useLiveQuery(
    () =>
      deckId
        ? db.cards
            .where("deck_id")
            .equals(deckId)
            .filter((c) => c.deleted_at === null)
            .toArray()
        : [],
    [deckId],
  );

  return {
    data: cards ?? [],
    isLoading: cards === undefined,
  };
}

export function useCardById(cardId: string) {
  const card = useLiveQuery(() => db.cards.get(cardId), [cardId]);
  return { data: card ?? null, isLoading: card === undefined };
}

export function useCreateCard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      deck_id: string;
      type: CardType;
      front: string;
      back: string;
    }) => {
      const now = new Date().toISOString();
      const cardId = crypto.randomUUID();

      const card: ICard = {
        id: cardId,
        deck_id: input.deck_id,
        type: input.type,
        front: input.front,
        back: input.back,
        created_at: now,
        updated_at: now,
        pending_sync: 1,
        deleted_at: null,
      };

      const fsrsCard = createEmptyCard(new Date(now));

      const cardState: ICardState = {
        id: crypto.randomUUID(),
        card_id: cardId,
        stability: fsrsCard.stability,
        difficulty: fsrsCard.difficulty,
        due: fsrsCard.due.toISOString(),
        last_review: fsrsCard.last_review
          ? new Date(fsrsCard.last_review).toISOString()
          : null,
        state: fsrsCard.state,
        reps: fsrsCard.reps,
        lapses: fsrsCard.lapses,
        learning_steps: fsrsCard.learning_steps,
        updated_at: now,
        pending_sync: 1,
      };

      await db.transaction("rw", db.cards, db.card_state, async () => {
        await db.cards.add(card);
        await db.card_state.add(cardState);
      });

      return card;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(i18next.t("cardCreated"));
    },

    onError: () => {
      toast.error(i18next.t("cardCreatedError"));
    },
  });
}

export function useUpdateCard() {
  return useMutation({
    mutationFn: async (input: {
      id: string;
      front: string;
      back: string;
      deck_id?: string;
      type?: CardType;
    }) => {
      const now = new Date().toISOString();

      await db.cards.update(input.id, {
        front: input.front,
        back: input.back,
        ...(input.deck_id ? { deck_id: input.deck_id } : {}),
        ...(input.type ? { type: input.type } : {}),
        updated_at: now,
        pending_sync: 1,
      });

      return input;
    },

    onSuccess: () => {
      toast.success(i18next.t("cardUpdated"));
    },

    onError: () => {
      toast.error(i18next.t("cardUpdatedError"));
    },
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (cardId: string) => {
      const now = new Date().toISOString();
      await db.cards.update(cardId, {
        deleted_at: now,
        updated_at: now,
        pending_sync: 1,
      });
      return cardId;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(i18next.t("cardDeleted"));
    },

    onError: () => {
      toast.error(i18next.t("cardDeletedError"));
    },
  });
}
