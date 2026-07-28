import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { db, clearLocalDb } from "@/lib/db";
import { useAuthStore } from "@/store";
import { resetSyncState } from "@/hooks/useSync";

import {
  applyStatsResetLocally,
  flushPendingChanges,
  runExclusiveDataOperation,
} from "@/lib/sync";

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () =>
      runExclusiveDataOperation(async () => {
        const { error } = await supabase.functions.invoke("delete-account");
        if (error) throw error;

        await clearLocalDb();

        resetSyncState();
        await supabase.auth.signOut();
        useAuthStore.getState().logout();
      }),
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

      if (!(await flushPendingChanges(user.id))) {
        throw new Error("Pending changes could not be synchronized");
      }

      await runExclusiveDataOperation(async () => {
        const { data, error } = await supabase.rpc("reset_statistics");
        if (error) throw error;

        if (typeof data !== "string") {
          throw new Error("Invalid statistics reset timestamp");
        }

        await applyStatsResetLocally(user.id, data);

        const currentMeta = await db.sync_meta.get(user.id);

        await db.sync_meta.put({
          user_id: user.id,
          last_synced_at: currentMeta?.last_synced_at ?? null,
          initial_pull_done: currentMeta?.initial_pull_done ?? false,
          stats_reset_at: data,
          data_reset_at: currentMeta?.data_reset_at ?? null,
        });
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

      if (!(await flushPendingChanges(user.id))) {
        throw new Error("Pending changes could not be synchronized");
      }

      await runExclusiveDataOperation(async () => {
        const { data, error } = await supabase.rpc("reset_all_data");
        if (error) throw error;
        if (typeof data !== "string") {
          throw new Error("Invalid data reset timestamp");
        }

        await clearLocalDb();
        await db.sync_meta.put({
          user_id: user.id,
          last_synced_at: data,
          initial_pull_done: true,
          stats_reset_at: data,
          data_reset_at: data,
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
