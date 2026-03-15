import { useEffect } from "react";
import { useAuthStore, useLanguageStore, useThemeStore } from "@/store";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import type { ThemeVariant } from "@/store";
import { useDocumentHead } from "@/hooks";

import {
  Badge,
  Button,
  Card,
  Separator,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

import {
  ArrowRight,
  BarChart3,
  Brain,
  Clock,
  Flame,
  Github,
  Layers,
  Moon,
  Repeat2,
  Smartphone,
  Sun,
  Waves,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: WelcomeComponent,
});

function WelcomeComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useDocumentHead({
    title: t("welcomeSubtitle"),
    description: t("welcomeHeroDesc"),
  });

  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { theme, setTheme } = useThemeStore();
  const { language: lang, setLanguage: setLang } = useLanguageStore();

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoading, user, navigate]);

  const THEMES: { value: ThemeVariant; icon: React.ReactNode }[] = [
    { value: "light", icon: <Sun className="size-3.5" /> },
    { value: "dark", icon: <Moon className="size-3.5" /> },
    { value: "ocean", icon: <Waves className="size-3.5" /> },
  ];

  const LANGS: { value: "en" | "es" | "pt-BR"; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "es", label: "ES" },
    { value: "pt-BR", label: "PT" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (user) return null;

  const features = [
    {
      id: "fsrs",
      icon: Brain,
      label: t("welcomeFeatureFsrsLabel"),
      description: t("welcomeFeatureFsrsDesc"),
      color: "bg-error-soft text-error",
    },
    {
      id: "srs",
      icon: Repeat2,
      label: t("welcomeFeatureSrsLabel"),
      description: t("welcomeFeatureSrsDesc"),
      color: "bg-warning-soft text-warning",
    },
    {
      id: "stats",
      icon: BarChart3,
      label: t("welcomeFeatureStatsLabel"),
      description: t("welcomeFeatureStatsDesc"),
      color: "bg-success-soft text-success",
    },
    {
      id: "decks",
      icon: Layers,
      label: t("welcomeFeatureDecksLabel"),
      description: t("welcomeFeatureDecksDesc"),
      color: "bg-primary-soft text-primary",
    },
    {
      id: "offline",
      icon: Zap,
      label: t("welcomeFeatureOfflineLabel"),
      description: t("welcomeFeatureOfflineDesc"),
      color: "bg-secondary-soft text-secondary",
    },
    {
      id: "pwa",
      icon: Smartphone,
      label: t("welcomeFeaturePwaLabel"),
      description: t("welcomeFeaturePwaDesc"),
      color: "bg-[#f6cc91] text-[#925913]",
    },
  ];

  const steps = [
    {
      step: "01",
      title: t("welcomeStep01Title"),
      description: t("welcomeStep01Desc"),
    },
    {
      step: "02",
      title: t("welcomeStep02Title"),
      description: t("welcomeStep02Desc"),
    },
    {
      step: "03",
      title: t("welcomeStep03Title"),
      description: t("welcomeStep03Desc"),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 pb-20 pt-16 md:flex-row md:items-start md:gap-16 md:pb-24 md:pt-24">
        <div className="flex flex-1 flex-col items-center gap-6 text-center md:items-start md:text-left">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
            {t("welcomeHeroTitle")}
            <br />
            <span className="text-primary">{t("welcomeHeroTitleAccent")}</span>
          </h1>

          <Text
            as="p"
            className="max-w-sm text-base leading-relaxed text-muted"
          >
            {t("welcomeHeroDesc")}
          </Text>

          <div className="flex items-center gap-6">
            <Link to="/auth/sign-up">
              <Button className="gap-1 rounded-full">
                {t("welcomeHeroCta")}
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>

            <Link
              to="/auth/login"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {t("welcomeHeroLogin")}
            </Link>
          </div>
        </div>

        <div className="relative hidden w-80 shrink-0 mr-6 md:block md:mt-6">
          <div className="absolute -left-3 -top-6 w-full rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-secondary-soft">
                    <Brain className="size-3.5 text-secondary" />
                  </div>
                  <Text as="span" className="text-xs font-medium text-muted">
                    {t("welcomeHeroCardDeck")}
                  </Text>
                </div>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-10 rounded-full bg-primary" />
                </div>
              </div>
              <Text as="p" className="text-sm font-medium text-foreground">
                {t("welcomeHeroCardQuestion")}
              </Text>
            </div>
          </div>

          <div className="relative ml-6 mt-14 w-full rounded-2xl border border-border bg-background p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <Text as="p" className="text-sm text-muted">
                {t("welcomeHeroCardAnswerLabel")}
              </Text>
              <Text as="p" className="text-sm leading-relaxed text-foreground">
                {t("welcomeHeroCardAnswer")}
              </Text>
              <div className="flex items-center gap-1.5 border-t border-border pt-3">
                <div className="flex h-7 flex-1 items-center justify-center rounded-lg bg-error-soft">
                  <Text
                    as="span"
                    className="text-xs font-medium text-error-text"
                  >
                    {t("studyRatingAgain")}
                  </Text>
                </div>
                <div className="flex h-7 flex-1 items-center justify-center rounded-lg bg-warning-soft">
                  <Text
                    as="span"
                    className="text-xs font-medium text-warning-text"
                  >
                    {t("studyRatingHard")}
                  </Text>
                </div>
                <div className="flex h-7 flex-1 items-center justify-center rounded-lg bg-primary-soft">
                  <Text
                    as="span"
                    className="text-xs font-medium text-primary-text"
                  >
                    {t("studyRatingGood")}
                  </Text>
                </div>
                <div className="flex h-7 flex-1 items-center justify-center rounded-lg bg-success-soft">
                  <Text
                    as="span"
                    className="text-xs font-medium text-success-text"
                  >
                    {t("studyRatingEasy")}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-3 -right-3 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm">
            <Flame className="size-3.5 text-warning" />
            <Text as="span" className="text-xs font-medium text-foreground">
              {t("welcomeHeroCardStreak")}
            </Text>
          </div>
        </div>
      </section>

      <Separator />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-20">
        <div className="flex flex-col gap-2 text-center">
          <Text
            as="h2"
            className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          >
            {t("welcomeHowItWorksTitle")}
          </Text>

          <Text as="p" className="mx-auto max-w-lg text-sm text-muted">
            {t("welcomeHowItWorksSubtitle")}
          </Text>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft">
                <Text as="span" className="text-sm font-bold text-primary">
                  {s.step}
                </Text>
              </div>

              <Text as="h3" className="text-base font-semibold text-foreground">
                {s.title}
              </Text>

              <Text as="p" className="text-sm leading-relaxed text-muted">
                {s.description}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-20">
        <div className="flex flex-col gap-2 text-center">
          <Text
            as="h2"
            className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          >
            {t("welcomeFeaturesTitle")}
          </Text>

          <Text as="p" className="mx-auto max-w-lg text-sm text-muted">
            {t("welcomeFeaturesSubtitle")}
          </Text>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.id}
              className="flex flex-col gap-3 border border-border bg-surface p-5"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${f.color}`}
              >
                <f.icon className="size-5" />
              </div>

              <Text as="h3" className="text-sm font-semibold text-foreground">
                {f.label}
              </Text>

              <Text as="p" className="text-sm leading-relaxed text-muted">
                {f.description}
              </Text>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-20">
        <div className="flex flex-col gap-2 text-center">
          <Text
            as="h2"
            className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          >
            {t("welcomeWhyFsrsTitle")}
          </Text>

          <Text as="p" className="mx-auto max-w-lg text-sm text-muted">
            {t("welcomeWhyFsrsSubtitle")}
          </Text>
        </div>

        <Card className="border border-border bg-surface p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
              <div className="flex flex-1 flex-col gap-4">
                <Text
                  as="h3"
                  className="text-base font-semibold text-foreground"
                >
                  {t("welcomeWhyFsrsName")}
                </Text>

                <Text as="p" className="text-sm leading-relaxed text-muted">
                  {t("welcomeWhyFsrsDesc1")}
                </Text>

                <Text as="p" className="text-sm leading-relaxed text-muted">
                  {t("welcomeWhyFsrsDesc2")}
                </Text>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-5 md:w-64">
                <Text
                  as="span"
                  className="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {t("welcomeCompareTitle")}
                </Text>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <Text as="span" className="text-sm text-foreground">
                      {t("welcomeCompareFsrs")}
                    </Text>

                    <Badge>{t("welcomeCompareFsrsBadge")}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <Text as="span" className="text-sm text-muted">
                      {t("welcomeCompareSm2")}
                    </Text>

                    <Badge variant="outline">
                      {t("welcomeCompareSm2Badge")}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <Text as="span" className="text-sm text-muted">
                      {t("welcomeCompareLeitner")}
                    </Text>

                    <Badge variant="outline">
                      {t("welcomeCompareLeitnerBadge")}
                    </Badge>
                  </div>
                </div>

                <Separator variant="dashed" />

                <Text as="p" className="text-xs leading-relaxed text-muted">
                  {t("welcomeCompareDesc")}
                </Text>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-around gap-4 border-t border-border pt-6">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-primary" />

                  <Text
                    as="span"
                    className="text-lg font-bold tabular-nums text-foreground md:text-xl"
                  >
                    {t("welcomeStatRetentionValue")}
                  </Text>
                </div>

                <Text as="span" className="text-xs text-muted">
                  {t("welcomeStatRetentionLabel")}
                </Text>
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-2">
                  <Repeat2 className="size-5 text-primary" />

                  <Text
                    as="span"
                    className="text-lg font-bold tabular-nums text-foreground md:text-xl"
                  >
                    {t("welcomeStatReviewsValue")}
                  </Text>
                </div>

                <Text as="span" className="text-xs text-muted">
                  {t("welcomeStatReviewsLabel")}
                </Text>
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-2">
                  <Flame className="size-5 text-primary" />

                  <Text
                    as="span"
                    className="text-lg font-bold tabular-nums text-foreground md:text-xl"
                  >
                    {t("welcomeStatRecallValue")}
                  </Text>
                </div>

                <Text as="span" className="text-xs text-muted">
                  {t("welcomeStatRecallLabel")}
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-20 text-center">
          <div className="flex flex-col gap-2 text-center">
            <Text
              as="h2"
              className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              {t("welcomeCtaTitle")}
            </Text>

            <Text as="p" className="text-sm text-muted">
              {t("welcomeCtaDesc")}
            </Text>
          </div>

          <Link to="/auth/sign-up">
            <Button size="lg" className="gap-2">
              {t("welcomeCtaButton")}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 py-5 sm:flex-row sm:justify-between">
          <Text as="span" className="text-xs text-muted">
            © {new Date().getFullYear()} ThinkCards
          </Text>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {THEMES.map(({ value, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex items-center justify-center rounded-full transition-colors p-1.5",
                    theme === value
                      ? "text-foreground"
                      : "text-muted hover:text-foreground opacity-80",
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="h-3.5 w-px bg-border" />

            <div className="flex items-center gap-1">
              {LANGS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLang(value)}
                  className={cn(
                    "p-2 text-xs transition-colors rounded-full",
                    lang === value
                      ? "text-foreground"
                      : "text-muted hover:text-foreground opacity-80",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="h-3.5 w-px bg-border" />

            <a
              href="https://github.com/vs-front-end/think-cards"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
            >
              <Github className="size-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
