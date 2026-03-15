import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { db } from "@/lib/db";

export function useNavigateToStudy() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useCallback(
    async (deckId: string) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const cards = await db.cards
        .where("deck_id")
        .equals(deckId)
        .filter((c) => c.deleted_at === null)
        .toArray();

      if (cards.length === 0) {
        toast.info(t("deckNoCardsDue"), { duration: 3000 });
        return;
      }

      const cardIds = cards.map((c) => c.id);
      const dueCount = await db.card_state
        .where("card_id")
        .anyOf(cardIds)
        .filter((s) => new Date(s.due) <= today)
        .count();

      if (dueCount === 0) {
        toast.info(t("deckNoCardsDue"), { duration: 3000 });
        return;
      }

      navigate({ to: "/study", search: { deckId } });
    },
    [navigate, t],
  );
}
