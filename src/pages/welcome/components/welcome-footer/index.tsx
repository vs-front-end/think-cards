import { cn } from "@stellar-ui-kit/shared";
import { Github, Moon, Sun, Waves } from "lucide-react";
import { Text } from "@stellar-ui-kit/web";
import { useLanguageStore, useThemeStore } from "@/store";
import type { ThemeVariant } from "@/store";

const THEMES: { value: ThemeVariant; icon: React.ReactNode }[] = [
  { value: "light", icon: <Sun className="size-3" /> },
  { value: "dark", icon: <Moon className="size-3" /> },
  { value: "ocean", icon: <Waves className="size-3" /> },
];

const LANGS: { value: "en" | "es" | "pt-BR"; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "pt-BR", label: "PT" },
];

export const WelcomeFooter = () => {
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

          <div className="flex items-center gap-0.5">
            {LANGS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-label={`Change language to ${label}`}
                onClick={() => setLang(value)}
                className={cn(
                  "px-1.5 py-1 text-xs transition-colors",
                  lang === value
                    ? "font-medium text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

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
