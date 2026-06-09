export type Language =
  | "en"
  | "es"
  | "pt-BR"
  | "de"
  | "fr"
  | "it"
  | "ja"
  | "ko"
  | "ru"
  | "zh";

export const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "es",
  "pt-BR",
  "de",
  "fr",
  "it",
  "ja",
  "ko",
  "ru",
  "zh",
];

export const LANGUAGE_STORAGE_KEY = "think-cards-language";

export const isLanguage = (value: string): value is Language =>
  (SUPPORTED_LANGUAGES as string[]).includes(value);

export const getDefaultLanguage = (): Language => {
  if (typeof navigator === "undefined") return "en";

  const lang = navigator.language?.toLowerCase() ?? "";

  if (lang.startsWith("pt")) return "pt-BR";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("it")) return "it";
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("ru")) return "ru";
  if (lang.startsWith("zh")) return "zh";

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
