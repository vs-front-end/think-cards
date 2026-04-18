export type Language = "en" | "es" | "pt-BR";

export const LANGUAGE_STORAGE_KEY = "think-cards-language";

export const isLanguage = (value: string): value is Language => {
  return value === "en" || value === "es" || value === "pt-BR";
};

export const getDefaultLanguage = (): Language => {
  if (typeof navigator === "undefined") return "en";

  const lang = navigator.language?.toLowerCase();
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("pt")) return "pt-BR";

  return "en";
};

export const readPersistedLanguage = (): Language | null => {
  if (typeof localStorage === "undefined") return null;

  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { state?: { language?: unknown } };
    const lang = parsed.state?.language;
    if (typeof lang === "string" && isLanguage(lang)) return lang;

    return null;
  } catch {
    return null;
  }
};

export const resolveInitialLanguage = (): Language => {
  return readPersistedLanguage() ?? getDefaultLanguage();
};
