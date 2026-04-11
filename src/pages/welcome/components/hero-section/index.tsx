import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { cn } from "@stellar-ui-kit/shared";
import { ArrowRight, Flame } from "lucide-react";
import { Button, Text } from "@stellar-ui-kit/web";

const HERO_BADGES = [
  { val: "FSRS", labelKey: "welcomeFeatureFsrsLabel" },
  { val: "100%", labelKey: "welcomeCompareFeatureOpenSource" },
  { val: "PWA", labelKey: "welcomeFeatureOfflineLabel" },
];

const RATING_BUTTONS = [
  { labelKey: "studyRatingAgain", color: "text-error-text bg-error-soft" },
  { labelKey: "studyRatingHard", color: "text-warning-text bg-warning-soft" },
  { labelKey: "studyRatingGood", color: "text-primary-text bg-primary-soft" },
  { labelKey: "studyRatingEasy", color: "text-success-text bg-success-soft" },
];

const DISTRIBUTION_LEGEND = [
  { color: "bg-primary", labelKey: "statsNew" },
  { color: "bg-secondary", labelKey: "statsLearning" },
  { color: "bg-success", labelKey: "statsReview" },
];

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
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
              {HERO_BADGES.map((s, i) => (
                <div
                  key={s.val}
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
                  <span className="text-[10px] text-muted">
                    {t(s.labelKey)}
                  </span>
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

                  <span className="font-mono text-[10px] text-muted">60%</span>
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
                {RATING_BUTTONS.map((r) => (
                  <div
                    key={r.labelKey}
                    className={cn(
                      "flex items-center justify-center py-2.5",
                      r.color,
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      {t(r.labelKey)}
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
                {DISTRIBUTION_LEGEND.map((d) => (
                  <div key={d.labelKey} className="flex items-center gap-1.5">
                    <div className={cn("size-1.5 rounded-full", d.color)} />
                    <span className="text-xs text-muted">{t(d.labelKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
