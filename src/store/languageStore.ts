import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18next from "@/lib/i18n";

export type Language = "en" | "es";

const getDefaultLanguage = (): Language => {
  if (typeof navigator === "undefined") return "en";

  const lang = navigator.language?.toLowerCase();
  if (lang.startsWith("es")) return "es";

  return "en";
};

const initialLanguage = getDefaultLanguage();
i18next.changeLanguage(initialLanguage);

type LanguageStore = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: initialLanguage,
      setLanguage: (language) => {
        i18next.changeLanguage(language);
        set({ language });
      },
    }),
    { name: "think-cards-language" },
  ),
);
