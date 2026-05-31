import { createEmptyCard } from "ts-fsrs";

import { db } from "@/lib/db";
import type { CardType, ICard, ICardState } from "@/lib/db";

export type NewCardInput = { type: CardType; front: string; back: string };

export const bulkAddCards = async (
  deckId: string,
  cards: NewCardInput[],
): Promise<void> => {
  const now = new Date().toISOString();

  await db.transaction("rw", db.cards, db.card_state, async () => {
    for (const card of cards) {
      const cardId = crypto.randomUUID();
      const fsrsCard = createEmptyCard(new Date(now));

      const newCard: ICard = {
        id: cardId,
        deck_id: deckId,
        type: card.type,
        front: card.front,
        back: card.back,
        created_at: now,
        updated_at: now,
        pending_sync: 1,
        deleted_at: null,
      };

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

      await db.cards.add(newCard);
      await db.card_state.add(cardState);
    }
  });
};
