import { create } from "zustand";

type CreateIntent = "deck" | "card" | null;

type CreateIntentStore = {
  createIntent: CreateIntent;
  openCreateDeck: () => void;
  openCreateCard: () => void;
  clearCreateIntent: () => void;
};

export const useCreateIntentStore = create<CreateIntentStore>()((set) => ({
  createIntent: null,
  openCreateDeck: () => set({ createIntent: "deck" }),
  openCreateCard: () => set({ createIntent: "card" }),
  clearCreateIntent: () => set({ createIntent: null }),
}));
