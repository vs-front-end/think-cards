import { describe, expect, it } from "vitest";
import de from "@/locales/de/translation.json";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import fr from "@/locales/fr/translation.json";
import italian from "@/locales/it/translation.json";
import ja from "@/locales/ja/translation.json";
import ko from "@/locales/ko/translation.json";
import ptBr from "@/locales/pt-BR/translation.json";
import ru from "@/locales/ru/translation.json";
import zh from "@/locales/zh/translation.json";

const translations = {
  de,
  en,
  es,
  fr,
  it: italian,
  ja,
  ko,
  "pt-BR": ptBr,
  ru,
  zh,
};

describe("public product claims", () => {
  it("does not advertise unsupported export or retention controls", () => {
    for (const [locale, translation] of Object.entries(translations)) {
      expect(
        Object.hasOwn(translation, "welcomeCompareFeatureRetention"),
        locale,
      ).toBe(false);
      expect(
        Object.hasOwn(translation, "welcomeCompareConfigurable"),
        locale,
      ).toBe(false);
      expect(translation.welcomeFaq6A, locale).not.toMatch(
        /export|esport|エクスポート|내보|экспорт|导出/iu,
      );
    }
  });

  it("qualifies offline media and PWA support in every language", () => {
    for (const [locale, translation] of Object.entries(translations)) {
      expect(translation.welcomeFaq3A, locale).toMatch(
        /media|mídia|medios|medien|médias|メディア|미디어|медиа|媒体/iu,
      );
      expect(translation.welcomeFeaturePwaLabel, locale).toMatch(/PWA/iu);
    }
  });
});
