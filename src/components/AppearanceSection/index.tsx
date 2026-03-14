import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Moon, Sun, Waves } from "lucide-react";
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
    <div className="inline-flex w-full flex-wrap gap-2">
      {THEMES.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
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
  );
}
