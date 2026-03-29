import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Moon, Sun, Waves } from "lucide-react";
import { Button, Text } from "@stellar-ui-kit/web";
import { useThemeStore } from "@/store";
import type { ThemeVariant } from "@/store";

const THEMES: {
  value: ThemeVariant;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "light", label: "themeLight", icon: <Sun className="size-4" /> },
  { value: "dark", label: "themeDark", icon: <Moon className="size-4" /> },
  { value: "ocean", label: "themeOcean", icon: <Waves className="size-4" /> },
];

export const ThemeSelector = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = (theme: ThemeVariant) => setTheme(theme);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text as="p" className="text-sm font-semibold">
          {t("settingsSectionAppearance")}
        </Text>
        <Text as="p" className="text-xs text-muted">
          {t("settingsAppearanceDesc")}
        </Text>
      </div>

      <div className="inline-flex flex-wrap gap-2">
        {THEMES.map(({ value, label, icon }) => (
          <Button
            key={value}
            variant="outline"
            onClick={() => handleThemeChange(value)}
            className={cn(
              "flex-1 h-8 font-normal",
              theme === value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-transparent text-muted hover:border-foreground hover:text-foreground",
            )}
          >
            {icon}
            <span className="truncate">{t(label)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
