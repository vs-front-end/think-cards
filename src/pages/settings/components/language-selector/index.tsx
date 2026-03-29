import i18next from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Languages } from "lucide-react";
import { Button, Text } from "@stellar-ui-kit/web";

type SupportedLanguages = "en" | "es" | "pt-BR";

const LANGUAGES: { value: SupportedLanguages; label: string }[] = [
  { value: "en", label: "languageEn" },
  { value: "es", label: "languageEs" },
  { value: "pt-BR", label: "languagePtBR" },
];

export const LanguageSelector = () => {
  const { t } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguages>(
    i18next.language as SupportedLanguages,
  );

  const handleLanguageChange = (lang: SupportedLanguages) => {
    setSelectedLanguage(lang);
    i18next.changeLanguage(lang).catch(() => undefined);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text as="p" className="text-sm font-semibold">
          {t("settingsSectionLanguage")}
        </Text>
        <Text as="p" className="text-xs text-muted">
          {t("settingsLanguageDesc")}
        </Text>
      </div>

      <div className="inline-flex flex-wrap gap-2">
        {LANGUAGES.map(({ value, label }) => (
          <Button
            key={value}
            variant="outline"
            onClick={() => handleLanguageChange(value)}
            className={cn(
              "flex-1 h-8 font-normal",
              selectedLanguage === value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-transparent text-muted hover:border-foreground hover:text-foreground",
            )}
          >
            <Languages className="size-4" />
            <span className="truncate">{t(label)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
