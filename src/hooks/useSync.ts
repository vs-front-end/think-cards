import { useEffect, useRef } from "react";
import i18next from "i18next";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSyncStore, useAuthStore } from "@/store";
import { syncAll } from "@/lib/sync";

const { setInitialSyncDone } = useSyncStore.getState();

const MAX_CONSECUTIVE_FAILURES = 3;
const SYNC_INTERVAL_MS = 60_000;
let syncScheduled = false;

export function useSync() {
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const failureCount = useRef(0);
  const qc = useQueryClient();

  const runSync = async (userId: string) => {
    try {
      const synced = await syncAll(userId);
      failureCount.current = 0;

      if (synced) {
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.success(i18next.t("syncSuccess"), { duration: 2000 });
      }
    } catch (err) {
      console.error("[sync] failed:", err);
      failureCount.current += 1;

      if (failureCount.current >= MAX_CONSECUTIVE_FAILURES) {
        toast.error(i18next.t("syncError"), { duration: 5000 });
        failureCount.current = 0;
      }
    }
  };

  useEffect(() => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    if (!syncScheduled) {
      syncScheduled = true;

      runSync(userId).finally(() => {
        syncScheduled = false;
        setInitialSyncDone();
      });
    }

    const handleOnline = () => {
      const uid = useAuthStore.getState().user?.id;
      if (uid) runSync(uid);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const uid = useAuthStore.getState().user?.id;
        if (uid) runSync(uid);
      }
    };

    const interval = setInterval(() => {
      const uid = useAuthStore.getState().user?.id;
      if (uid) runSync(uid);
    }, SYNC_INTERVAL_MS);

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  return { isSyncing };
}
