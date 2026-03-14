import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeVariant = "light" | "dark" | "ocean";

const getSystemTheme = (): ThemeVariant => {
  if (typeof window === "undefined") return "dark";

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

type ThemeStore = {
  theme: ThemeVariant;
  setTheme: (variant: ThemeVariant) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: getSystemTheme(),
      setTheme: (variant) => set({ theme: variant }),
    }),
    { name: "think-cards-theme" },
  ),
);
