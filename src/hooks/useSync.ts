import { useCallback, useEffect } from "react";
import i18next from "i18next";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSyncStore, useAuthStore } from "@/store";
import { syncAll } from "@/lib/sync";

let syncScheduled = false;
let currentSyncSession = 0;
let listenersOwner = false;

export const resetSyncState = () => {
  syncScheduled = false;
  currentSyncSession++;
  useSyncStore.getState().reset();
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const syncWithRetry = async (userId: string): Promise<boolean> => {
  try {
    return await syncAll(userId);
  } catch (firstErr) {
    if (!navigator.onLine) throw firstErr;
    await wait(2000);
    return syncAll(userId);
  }
};

const runSyncInternal = async (
  userId: string,
  qc: ReturnType<typeof useQueryClient>,
  showToast: boolean,
): Promise<void> => {
  try {
    const synced = await syncWithRetry(userId);

    if (synced) {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["dashboard"] }),
        qc.invalidateQueries({ queryKey: ["statistics"] }),
      ]);
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

      let settled = false;

      const markInitialSyncDone = () => {
        if (settled) return;
        settled = true;
        if (currentSyncSession === sessionAtStart) {
          useSyncStore.getState().setInitialSyncDone();
        }
      };

      if (!navigator.onLine) {
        markInitialSyncDone();
      }

      runSync(userId, false).finally(() => {
        syncScheduled = false;
        markInitialSyncDone();
      });
    }

    if (listenersOwner) return;
    listenersOwner = true;

    let syncTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleSync = () => {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        if (userId && navigator.onLine) runSync(userId);
      }, 1500);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      scheduleSync();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", scheduleSync);

    return () => {
      clearTimeout(syncTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", scheduleSync);
      listenersOwner = false;
    };
  }, [userId, runSync]);

  return { isSyncing, triggerSync };
};
