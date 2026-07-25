import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmptyCard } from "ts-fsrs";

import { supabase } from "@/lib/supabase";
import { db, clearLocalDb } from "@/lib/db";
import { useAuthStore } from "@/store";
import { resetSyncState } from "@/hooks/useSync";

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;

      await clearLocalDb();

      resetSyncState();
      await supabase.auth.signOut();
      useAuthStore.getState().logout();
    },
  });
};

export const useResetStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const { data: decks, error: decksError } = await supabase
        .from("decks")
        .select("id")
        .eq("user_id", user.id);
      if (decksError) throw decksError;

      const deckIds = (decks ?? []).map((deck) => deck.id);

      const now = new Date();
      const fresh = createEmptyCard(now);
      const nowIso = now.toISOString();
      const freshDueIso = fresh.due.toISOString();

      const { error: revlogError } = await supabase
        .from("revlog")
        .delete()
        .eq("user_id", user.id);
      if (revlogError) throw revlogError;

      const { error: sessionError } = await supabase
        .from("session_log")
        .delete()
        .eq("user_id", user.id);
      if (sessionError) throw sessionError;

      if (deckIds.length > 0) {
        const { data: cards, error: cardsError } = await supabase
          .from("cards")
          .select("id")
          .in("deck_id", deckIds);
        if (cardsError) throw cardsError;

        const cardIds = (cards ?? []).map((card) => card.id);

        if (cardIds.length > 0) {
          const { error: stateError } = await supabase
            .from("card_state")
            .update({
              stability: fresh.stability,
              difficulty: fresh.difficulty,
              due: freshDueIso,
              last_review: null,
              state: fresh.state,
              reps: fresh.reps,
              lapses: fresh.lapses,
              learning_steps: fresh.learning_steps,
              updated_at: nowIso,
            })
            .in("card_id", cardIds);
          if (stateError) throw stateError;
        }
      }

      await Promise.all([db.revlog.clear(), db.session_log.clear()]);

      await db.card_state.toCollection().modify({
        stability: fresh.stability,
        difficulty: fresh.difficulty,
        due: freshDueIso,
        last_review: null,
        state: fresh.state,
        reps: fresh.reps,
        lapses: fresh.lapses,
        learning_steps: fresh.learning_steps,
        updated_at: nowIso,
        pending_sync: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useResetData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const { data: decks, error: decksError } = await supabase
        .from("decks")
        .select("id")
        .eq("user_id", user.id);
      if (decksError) throw decksError;

      const deckIds = (decks ?? []).map((deck) => deck.id);

      if (deckIds.length > 0) {
        const { data: cards, error: cardsError } = await supabase
          .from("cards")
          .select("id")
          .in("deck_id", deckIds);
        if (cardsError) throw cardsError;

        const cardIds = (cards ?? []).map((card) => card.id);

        if (cardIds.length > 0) {
          const { error: revlogError } = await supabase
            .from("revlog")
            .delete()
            .in("card_id", cardIds);
          if (revlogError) throw revlogError;

          const { error: stateError } = await supabase
            .from("card_state")
            .delete()
            .in("card_id", cardIds);
          if (stateError) throw stateError;
        }

        const { error: sessionError } = await supabase
          .from("session_log")
          .delete()
          .in("deck_id", deckIds);
        if (sessionError) throw sessionError;

        const { error: cardsDeleteError } = await supabase
          .from("cards")
          .delete()
          .in("deck_id", deckIds);
        if (cardsDeleteError) throw cardsDeleteError;
      }

      const { error: decksDeleteError } = await supabase
        .from("decks")
        .delete()
        .eq("user_id", user.id);
      if (decksDeleteError) throw decksDeleteError;

      await clearLocalDb();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
