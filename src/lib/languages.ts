import US from "country-flag-icons/react/3x2/US";
import ES from "country-flag-icons/react/3x2/ES";
import BR from "country-flag-icons/react/3x2/BR";
import DE from "country-flag-icons/react/3x2/DE";
import FR from "country-flag-icons/react/3x2/FR";
import IT from "country-flag-icons/react/3x2/IT";
import JP from "country-flag-icons/react/3x2/JP";
import KR from "country-flag-icons/react/3x2/KR";
import RU from "country-flag-icons/react/3x2/RU";
import CN from "country-flag-icons/react/3x2/CN";

import type { Language } from "@/lib/language-preference";

type FlagComponent = typeof US;

export type LanguageOption = {
  value: Language;
  labelKey: string;
  Flag: FlagComponent;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "en", labelKey: "languageEn", Flag: US },
  { value: "es", labelKey: "languageEs", Flag: ES },
  { value: "pt-BR", labelKey: "languagePtBR", Flag: BR },
  { value: "de", labelKey: "languageDe", Flag: DE },
  { value: "fr", labelKey: "languageFr", Flag: FR },
  { value: "it", labelKey: "languageIt", Flag: IT },
  { value: "ja", labelKey: "languageJa", Flag: JP },
  { value: "ko", labelKey: "languageKo", Flag: KR },
  { value: "ru", labelKey: "languageRu", Flag: RU },
  { value: "zh", labelKey: "languageZh", Flag: CN },
];
