import { useEffect } from "react";
import { useAuthStore } from "@/store";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

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
  Layers,
  Repeat2,
  Smartphone,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: WelcomeComponent,
});

function WelcomeComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoading, user, navigate]);

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
      color: "bg-primary-soft text-primary",
    },
    {
      id: "srs",
      icon: Repeat2,
      label: t("welcomeFeatureSrsLabel"),
      description: t("welcomeFeatureSrsDesc"),
      color: "bg-secondary-soft text-secondary",
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
      color: "bg-warning-soft text-warning",
    },
    {
      id: "offline",
      icon: Zap,
      label: t("welcomeFeatureOfflineLabel"),
      description: t("welcomeFeatureOfflineDesc"),
      color: "bg-primary-soft text-primary",
    },
    {
      id: "pwa",
      icon: Smartphone,
      label: t("welcomeFeaturePwaLabel"),
      description: t("welcomeFeaturePwaDesc"),
      color: "bg-secondary-soft text-secondary",
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
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 pb-24 pt-20 text-center md:pt-28">
        <div className="flex items-center justify-center gap-1 rounded-full bg-secondary-soft text-secondary-text text-xs font-medium px-2 py-0.5">
          <Brain className="size-3" />
          {t("welcomeHeroBadge")}
        </div>

        <div className="flex flex-col gap-4">
          <Text
            as="h1"
            className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            {t("welcomeHeroTitle")}
            <br />
            {t("welcomeHeroTitleAccent")}
          </Text>

          <Text
            as="p"
            className="mx-auto max-w-xl text-base leading-relaxed text-muted md:text-lg"
          >
            {t("welcomeHeroDesc")}
          </Text>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth/sign-up">
            <Button size="lg" className="gap-2">
              {t("welcomeHeroCta")}
              <ArrowRight className="size-4" />
            </Button>
          </Link>

          <Link to="/auth/login">
            <Button size="lg" variant="outline">
              {t("welcomeHeroLogin")}
            </Button>
          </Link>
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

            <Text as="p" className="max-w-md text-sm text-muted">
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
    </div>
  );
}
