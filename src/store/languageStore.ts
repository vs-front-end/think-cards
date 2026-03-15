import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18next from "@/lib/i18n";

export type Language = "en" | "es" | "pt-BR";

const getDefaultLanguage = (): Language => {
  if (typeof navigator === "undefined") return "en";

  const lang = navigator.language?.toLowerCase();
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("pt")) return "pt-BR";

  return "en";
};

type LanguageStore = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: getDefaultLanguage(),
      setLanguage: (language) => {
        i18next.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: "think-cards-language",
      onRehydrateStorage: () => (state) => {
        if (state) i18next.changeLanguage(state.language);
      },
    },
  ),
);
