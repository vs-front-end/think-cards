import { useCallback, useEffect } from "react";
import i18next from "i18next";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSyncStore, useAuthStore } from "@/store";
import { syncAll } from "@/lib/sync";

let syncScheduled = false;
let currentSyncSession = 0;

export const resetSyncState = () => {
  syncScheduled = false;
  currentSyncSession++;
  useSyncStore.getState().reset();
};

const runSyncInternal = async (
  userId: string,
  qc: ReturnType<typeof useQueryClient>,
  showToast: boolean,
): Promise<void> => {
  try {
    const synced = await syncAll(userId);

    if (synced) {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (showToast) {
        toast.success(i18next.t("syncSuccess"), { duration: 2000 });
      }
    }
  } catch (err) {
    console.error("[sync] failed:", err);
    if (showToast) {
      toast.error(i18next.t("syncError"), { duration: 4000 });
    }
  }
};

export const useSync = () => {
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  const runSync = useCallback(
    (uid: string, showToast = true) => runSyncInternal(uid, qc, showToast),
    [qc],
  );

  const triggerSync = useCallback(() => {
    if (userId) runSync(userId);
  }, [runSync, userId]);

  useEffect(() => {
    if (!userId) return;

    if (!syncScheduled) {
      syncScheduled = true;
      const sessionAtStart = currentSyncSession;
      runSync(userId, false).finally(() => {
        syncScheduled = false;
        if (currentSyncSession === sessionAtStart) {
          useSyncStore.getState().setInitialSyncDone();
        }
      });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (userId) runSync(userId);
    };

    const handleOnline = () => {
      if (userId) runSync(userId);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [userId, runSync]);

  return { isSyncing, triggerSync };
};
