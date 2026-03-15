import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Moon, Sun, Waves } from "lucide-react";
import { Text } from "@stellar-ui-kit/web";
import { useThemeStore } from "@/store";
import type { ThemeVariant } from "@/store";

export function AppearanceSection() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  const THEMES: {
    value: ThemeVariant;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "light",
      label: t("themeLight"),
      icon: <Sun className="size-4" />,
    },
    { value: "dark", label: t("themeDark"), icon: <Moon className="size-4" /> },
    {
      value: "ocean",
      label: t("themeOcean"),
      icon: <Waves className="size-4" />,
    },
  ];

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
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              theme === value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-background text-muted hover:border-primary hover:text-foreground",
            )}
          >
            {icon}
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
