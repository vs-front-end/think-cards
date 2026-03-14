import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Languages } from "lucide-react";
import { useState } from "react";

type SupportedLanguage = "en" | "es" | "pt-BR";

export function LanguageSection() {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    i18next.language as SupportedLanguage,
  );

  const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
    { value: "en", label: t("languageEn") },
    { value: "es", label: t("languageEs") },
    { value: "pt-BR", label: t("languagePtBR") },
  ];

  function handleSelect(lang: SupportedLanguage) {
    setSelectedLanguage(lang);
    i18next.changeLanguage(lang).catch(() => undefined);
  }

  return (
    <div className="inline-flex w-full flex-wrap gap-2">
      {LANGUAGES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleSelect(value)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
            selectedLanguage === value
              ? "border-primary bg-primary-soft text-primary"
              : "border-border bg-background text-muted hover:border-primary hover:text-foreground",
          )}
        >
          <Languages className="size-4" />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  );
}
