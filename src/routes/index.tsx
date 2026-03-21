import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@stellar-ui-kit/shared";
import { useAuthStore, useLanguageStore, useThemeStore } from "@/store";
import type { ThemeVariant } from "@/store";
import { useDocumentHead } from "@/hooks";
import { CompareCell } from "@/utils";

import { Button, Spinner, Text } from "@stellar-ui-kit/web";

import {
  ArrowRight,
  BarChart3,
  Brain,
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
    { value: "light", icon: <Sun className="size-3" /> },
    { value: "dark", icon: <Moon className="size-3" /> },
    { value: "ocean", icon: <Waves className="size-3" /> },
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
      tag: "FSRS",
    },
    {
      id: "srs",
      icon: Repeat2,
      label: t("welcomeFeatureSrsLabel"),
      description: t("welcomeFeatureSrsDesc"),
      tag: "SRS",
    },
    {
      id: "stats",
      icon: BarChart3,
      label: t("welcomeFeatureStatsLabel"),
      description: t("welcomeFeatureStatsDesc"),
      tag: "Stats",
    },
    {
      id: "decks",
      icon: Layers,
      label: t("welcomeFeatureDecksLabel"),
      description: t("welcomeFeatureDecksDesc"),
      tag: "Decks",
    },
    {
      id: "offline",
      icon: Zap,
      label: t("welcomeFeatureOfflineLabel"),
      description: t("welcomeFeatureOfflineDesc"),
      tag: "Offline",
    },
    {
      id: "pwa",
      icon: Smartphone,
      label: t("welcomeFeaturePwaLabel"),
      description: t("welcomeFeaturePwaDesc"),
      tag: "PWA",
    },
  ];

  const compareRows = [
    {
      feature: t("welcomeCompareFeatureScheduling"),
      fsrs: t("welcomeCompareAdaptive"),
      sm2: t("welcomeCompareFixed"),
      leitner: t("welcomeCompareBoxBased"),
    },
    {
      feature: t("welcomeCompareFeatureAdapts"),
      fsrs: "check",
      sm2: "no",
      leitner: "no",
    },
    {
      feature: t("welcomeCompareFeatureRetention"),
      fsrs: t("welcomeCompareConfigurable"),
      sm2: t("welcomeCompareNone"),
      leitner: t("welcomeCompareNone"),
    },
    {
      feature: t("welcomeCompareFeatureOpenSource"),
      fsrs: "check",
      sm2: "partial",
      leitner: "check",
    },
  ];

  const faq = [
    { q: t("welcomeFaq1Q"), a: t("welcomeFaq1A") },
    { q: t("welcomeFaq2Q"), a: t("welcomeFaq2A") },
    { q: t("welcomeFaq3Q"), a: t("welcomeFaq3A") },
    { q: t("welcomeFaq4Q"), a: t("welcomeFaq4A") },
    { q: t("welcomeFaq5Q"), a: t("welcomeFaq5A") },
    { q: t("welcomeFaq6Q"), a: t("welcomeFaq6A") },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <section className="w-full border-b border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-0 md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_440px]">
            <div className="flex flex-col items-center py-12 text-center md:items-start md:border-r md:border-border md:pr-10 md:py-16 md:text-left lg:py-20">
              <Text as="span" className="text-xs font-medium text-muted">
                {t("welcomeHeroBadge")}
              </Text>

              <h1
                className="mt-4 text-foreground"
                style={{
                  fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                }}
              >
                {t("welcomeHeroTitle")}
                <br />
                <span className="text-primary">
                  {t("welcomeHeroTitleAccent")}
                </span>
              </h1>

              <p
                className="mt-6 max-w-[52ch] leading-relaxed text-muted"
                style={{ fontSize: "1.0625rem" }}
              >
                {t("welcomeHeroDesc")}
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Link to="/auth/sign-up">
                  <Button size="lg" className="gap-2 rounded-lg font-medium">
                    {t("welcomeHeroCta")}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>

                <Link to="/auth/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-lg font-medium shadow-none"
                  >
                    {t("welcomeHeroLogin")}
                  </Button>
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-0 overflow-hidden rounded-xl border border-border">
                {[
                  { val: "FSRS", label: t("welcomeFeatureFsrsLabel") },
                  { val: "100%", label: t("welcomeCompareFeatureOpenSource") },
                  { val: "PWA", label: t("welcomeFeatureOfflineLabel") },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-1 px-4 py-3",
                      i < 2 && "border-r border-border",
                    )}
                  >
                    <span
                      className="font-mono font-bold text-foreground"
                      style={{ fontSize: "1.2rem" }}
                    >
                      {s.val}
                    </span>
                    <span className="text-[10px] text-muted">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden flex-col justify-center gap-0 mt-2 py-12 md:flex md:pl-10 lg:py-16">
              <Text as="span" className="mb-3 text-xs text-muted">
                {t("welcomeHeroCardLabel")}
              </Text>

              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <span className="text-xs font-medium text-muted">
                    {t("welcomeHeroCardDeck")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border">
                      <div className="h-full w-12 rounded-full bg-primary" />
                    </div>
                    <span className="font-mono text-[10px] text-muted">
                      60%
                    </span>
                  </div>
                </div>

                <div className="border-b border-border bg-background px-4 py-5">
                  <Text
                    as="span"
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted"
                  >
                    {t("cardModalQuestionPlaceholder")}
                  </Text>
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {t("welcomeHeroCardQuestion")}
                  </p>
                </div>

                <div className="border-b border-border px-4 py-5">
                  <Text
                    as="span"
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted"
                  >
                    {t("welcomeHeroCardAnswerLabel")}
                  </Text>
                  <p className="text-sm leading-relaxed text-foreground">
                    {t("welcomeHeroCardAnswer")}
                  </p>
                </div>

                <div className="grid grid-cols-4 divide-x divide-border">
                  {[
                    {
                      label: t("studyRatingAgain"),
                      color: "text-error-text bg-error-soft",
                    },
                    {
                      label: t("studyRatingHard"),
                      color: "text-warning-text bg-warning-soft",
                    },
                    {
                      label: t("studyRatingGood"),
                      color: "text-primary-text bg-primary-soft",
                    },
                    {
                      label: t("studyRatingEasy"),
                      color: "text-success-text bg-success-soft",
                    },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className={cn(
                        "flex items-center justify-center py-2.5",
                        r.color,
                      )}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-border bg-surface p-3.5">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <Flame className="size-3.5 text-warning mb-0.5" />
                  <span className="text-[10px] font-semibold text-foreground tabular-nums">
                    7
                  </span>
                  <span className="text-[10px] text-muted uppercase tracking-wider">
                    {t("statsStreakLabel")}
                  </span>
                </div>

                <div className="flex gap-1">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 flex-1 rounded-sm",
                        i >= 7 ? "bg-border" : "bg-warning",
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-border bg-surface p-3.5">
                <Text
                  as="span"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted"
                >
                  {t("statsDistribution")}
                </Text>
                <div className="flex h-1.5 overflow-hidden rounded-full">
                  <div className="w-[20%] bg-primary" />
                  <div className="w-[30%] bg-secondary" />
                  <div className="w-[50%] bg-success" />
                </div>
                <div className="mt-2.5 flex items-center gap-4">
                  {[
                    { color: "bg-primary", label: t("statsNew") },
                    { color: "bg-secondary", label: t("statsLearning") },
                    { color: "bg-success", label: t("statsReview") },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center gap-1.5">
                      <div className={cn("size-1.5 rounded-full", d.color)} />
                      <span className="text-xs text-muted">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <h2
            className="mb-10 text-center text-foreground md:text-left"
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            {t("welcomeHowItWorksTitle")}
          </h2>

          <div className="grid gap-0 overflow-hidden rounded-xl border border-border md:grid-cols-3">
            {[
              {
                number: "01",
                title: t("welcomeStep01Title"),
                description: t("welcomeStep01Desc"),
              },
              {
                number: "02",
                title: t("welcomeStep02Title"),
                description: t("welcomeStep02Desc"),
              },
              {
                number: "03",
                title: t("welcomeStep03Title"),
                description: t("welcomeStep03Desc"),
              },
            ].map((step, i) => (
              <div
                key={step.number}
                className={cn(
                  "flex flex-col gap-4 p-8 text-center md:text-left",
                  i < 2 && "border-b border-border md:border-b-0 md:border-r",
                )}
              >
                <span
                  className="font-mono font-bold text-primary"
                  style={{ fontSize: "2rem", lineHeight: 1 }}
                >
                  {step.number}
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <h2
            className="mb-10 text-center text-foreground md:text-left"
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            {t("welcomeFeaturesTitle")}
          </h2>

          <div className="grid overflow-hidden rounded-xl border border-border md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.id}
                className={cn(
                  "flex flex-col gap-3 border-border p-7 text-center md:text-left",
                  i < features.length - 1 && "border-b",
                  i % 2 === 0 && "md:border-r",
                  i % 3 !== 2 && "lg:border-r",
                  i >= features.length - 3 && "lg:border-b-0",
                  i >= features.length - 2 && "md:border-b-0",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <f.icon className="size-4 text-muted" />
                  <span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-medium text-muted">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {f.label}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <h2
            className="text-center text-foreground md:text-left"
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            {t("welcomeCompareTitle")}
          </h2>
          <p className="mt-2 mb-10 text-center text-sm text-muted md:text-left">
            {t("welcomeCompareSubtitle")}
          </p>

          <div className="flex flex-col gap-3 md:hidden">
            {compareRows.map((row) => (
              <div
                key={row.feature}
                className="overflow-hidden rounded-xl border border-border"
              >
                <div className="border-b border-border px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-foreground">
                    {row.feature}
                  </span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-border">
                  {[
                    {
                      label: t("welcomeCompareFsrs"),
                      value: row.fsrs,
                      soft: true,
                    },
                    {
                      label: t("welcomeCompareSm2"),
                      value: row.sm2,
                      soft: false,
                    },
                    {
                      label: t("welcomeCompareLeitner"),
                      value: row.leitner,
                      soft: false,
                    },
                  ].map((col) => (
                    <div
                      key={col.label}
                      className={cn(
                        "flex flex-col items-center gap-1 px-3 py-3 text-center",
                        col.soft && "bg-primary-soft",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          col.soft ? "text-primary-text" : "text-muted",
                        )}
                      >
                        {col.label}
                      </span>
                      <CompareCell value={col.value} onSoft={col.soft} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left">
                    <span className="text-xs font-medium text-muted">
                      {t("welcomeFeatureFsrsLabel")}
                    </span>
                  </th>
                  <th className="bg-primary-soft px-5 py-3.5 text-center">
                    <span className="text-xs font-bold text-primary-text">
                      {t("welcomeCompareFsrs")}
                    </span>
                  </th>
                  <th className="px-5 py-3.5 text-center">
                    <span className="text-xs font-medium text-muted">
                      {t("welcomeCompareSm2")}
                    </span>
                  </th>
                  <th className="px-5 py-3.5 text-center">
                    <span className="text-xs font-medium text-muted">
                      {t("welcomeCompareLeitner")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-border last:border-none",
                      i % 2 === 1 && "bg-background",
                    )}
                  >
                    <td className="px-5 py-4 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="bg-primary-soft px-5 py-4 text-center">
                      <CompareCell value={row.fsrs} onSoft />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <CompareCell value={row.sm2} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <CompareCell value={row.leitner} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="w-full border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <h2
            className="text-center text-foreground md:text-left"
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            {t("welcomeFaqTitle")}
          </h2>
          <p className="mt-2 mb-10 text-center text-sm text-muted md:text-left">
            {t("welcomeFaqSubtitle")}
          </p>

          <div className="grid gap-0 overflow-hidden rounded-xl border border-border md:grid-cols-2">
            {faq.map(({ q, a }, i) => (
              <div
                key={q}
                className={cn(
                  "flex flex-col gap-2 border-b border-border p-6 text-center md:text-left",
                  i % 2 === 0 && "md:border-r",
                  i >= faq.length - 2 && "md:border-b-0",
                  i === faq.length - 1 && "border-b-0",
                )}
              >
                <h3 className="text-sm font-semibold leading-snug text-foreground">
                  {q}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-border bg-primary px-10 py-12 text-center md:flex-row md:items-center md:text-left">
            <div className="flex flex-col gap-2 md:items-start">
              <h2
                className="text-white"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                }}
              >
                {t("welcomeCtaTitle")}
              </h2>
              <p
                className="text-sm leading-relaxed text-white"
                style={{ opacity: 0.75 }}
              >
                {t("welcomeCtaDesc")}
              </p>
            </div>

            <Link to="/auth/sign-up" className="shrink-0 mt-0 md:mt-3">
              <Button
                size="lg"
                className="gap-2 rounded-lg bg-white font-medium text-primary hover:bg-white"
              >
                {t("welcomeCtaButton")}
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
    </div>
  );
}
