import { useTranslation } from "react-i18next";
import { Text } from "@stellar-ui-kit/web";
import { useLanguageStore } from "@/store";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import type { Language } from "@/lib/language-preference";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stellar-ui-kit/web";

export const LanguageSelector = () => {
  const { t } = useTranslation();
  const selectedLanguage = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

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

      <Select
        value={selectedLanguage}
        onValueChange={(v) => setLanguage(v as Language)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {LANGUAGE_OPTIONS.map(({ value, labelKey, Flag }) => (
            <SelectItem key={value} value={value}>
              <span className="flex items-center gap-2">
                <Flag className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                {t(labelKey)}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
