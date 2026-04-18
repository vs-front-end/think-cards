import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18next from "@/lib/i18n";

import {
  LANGUAGE_STORAGE_KEY,
  resolveInitialLanguage,
  type Language,
} from "@/lib/language-preference";

export type { Language };

type LanguageStore = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: resolveInitialLanguage(),
      setLanguage: (language) => {
        i18next.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state) i18next.changeLanguage(state.language);
      },
    },
  ),
);
