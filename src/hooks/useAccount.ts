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
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const deckIds = await supabase
        .from("decks")
        .select("id")
        .eq("user_id", user.id)
        .then(({ data }) => (data ?? []).map((d) => d.id));

      const now = new Date();
      const fresh = createEmptyCard(now);
      const nowIso = now.toISOString();
      const freshDueIso = fresh.due.toISOString();

      await supabase.from("revlog").delete().eq("user_id", user.id);
      await supabase.from("session_log").delete().eq("user_id", user.id);

      if (deckIds.length > 0) {
        const cardIds = await supabase
          .from("cards")
          .select("id")
          .in("deck_id", deckIds)
          .then(({ data }) => (data ?? []).map((c) => c.id));

        if (cardIds.length > 0) {
          await supabase
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
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const deckIds = await supabase
        .from("decks")
        .select("id")
        .eq("user_id", user.id)
        .then(({ data }) => (data ?? []).map((d) => d.id));

      if (deckIds.length > 0) {
        const cardIds = await supabase
          .from("cards")
          .select("id")
          .in("deck_id", deckIds)
          .then(({ data }) => (data ?? []).map((c) => c.id));

        if (cardIds.length > 0) {
          await supabase.from("revlog").delete().in("card_id", cardIds);
          await supabase.from("card_state").delete().in("card_id", cardIds);
        }

        await supabase.from("session_log").delete().in("deck_id", deckIds);
        await supabase.from("cards").delete().in("deck_id", deckIds);
      }

      await supabase.from("decks").delete().eq("user_id", user.id);

      await clearLocalDb();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
