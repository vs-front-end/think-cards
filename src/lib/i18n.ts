import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import ptBR from "@/locales/pt-BR/translation.json";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    "pt-BR": { translation: ptBR },
  },
  fallbackLng: "en",
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18next;
