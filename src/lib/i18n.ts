import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import ptBR from "@/locales/pt-BR/translation.json";
import de from "@/locales/de/translation.json";
import fr from "@/locales/fr/translation.json";
import it from "@/locales/it/translation.json";
import ja from "@/locales/ja/translation.json";
import ko from "@/locales/ko/translation.json";
import ru from "@/locales/ru/translation.json";
import zh from "@/locales/zh/translation.json";
import { resolveInitialLanguage, SUPPORTED_LANGUAGES } from "@/lib/language-preference";

i18next.use(initReactI18next).init({
  lng: resolveInitialLanguage(),
  resources: {
    en: { translation: en },
    es: { translation: es },
    "pt-BR": { translation: ptBR },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
    ja: { translation: ja },
    ko: { translation: ko },
    ru: { translation: ru },
    zh: { translation: zh },
  },
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LANGUAGES,
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18next;
