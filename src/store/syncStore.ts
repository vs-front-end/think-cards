import { create } from "zustand";

type SyncStore = {
  isSyncing: boolean;
  initialSyncDone: boolean;
  setIsSyncing: (isSyncing: boolean) => void;
  setInitialSyncDone: () => void;
  reset: () => void;
};

export const useSyncStore = create<SyncStore>()((set) => ({
  isSyncing: false,
  initialSyncDone: false,
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setInitialSyncDone: () => set({ initialSyncDone: true }),
  reset: () => set({ isSyncing: false, initialSyncDone: false }),
}));
