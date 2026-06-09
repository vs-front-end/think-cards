import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Github, Moon, Sun, Waves } from "lucide-react";
import { useLanguageStore, useThemeStore } from "@/store";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import type { Language } from "@/lib/language-preference";
import type { ThemeVariant } from "@/store";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from "@stellar-ui-kit/web";

const THEMES: { value: ThemeVariant; icon: React.ReactNode }[] = [
  { value: "light", icon: <Sun className="size-3" /> },
  { value: "dark", icon: <Moon className="size-3" /> },
  { value: "ocean", icon: <Waves className="size-3" /> },
];

export const WelcomeFooter = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { language: lang, setLanguage: setLang } = useLanguageStore();

  return (
    <footer className="w-full bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col-reverse items-center justify-between gap-5 px-6 py-6 sm:flex-row">
        <Text as="span" className="text-xs text-muted">
          &copy; {new Date().getFullYear()} ThinkCards
        </Text>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-0.5">
            {THEMES.map(({ value, icon }) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} theme`}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center justify-center p-1.5 transition-colors",
                  theme === value
                    ? "text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="h-3 w-px bg-border" />

          <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
            <SelectTrigger className="h-7 gap-1.5 border-none bg-transparent px-1.5 text-xs text-muted hover:text-foreground">
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

          <div className="h-3 w-px bg-border" />

          <a
            href="https://github.com/vs-front-end/think-cards"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ThinkCards on GitHub"
            className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
          >
            <Github className="size-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
