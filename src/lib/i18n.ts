import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import ptBR from "@/locales/pt-BR/translation.json";
import { resolveInitialLanguage } from "@/lib/language-preference";

i18next.use(initReactI18next).init({
  lng: resolveInitialLanguage(),
  resources: {
    en: { translation: en },
    es: { translation: es },
    "pt-BR": { translation: ptBR },
  },
  fallbackLng: "en",
  supportedLngs: ["en", "es", "pt-BR"],
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18next;
