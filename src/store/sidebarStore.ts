import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarStore = {
  collapsed: boolean;
  toggle: () => void;
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      collapsed: true,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: "think-cards-sidebar" },
  ),
);
