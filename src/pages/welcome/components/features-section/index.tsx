import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";

import {
  BarChart3,
  Brain,
  Layers,
  Repeat2,
  Smartphone,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    id: "fsrs",
    icon: Brain,
    label: "welcomeFeatureFsrsLabel",
    description: "welcomeFeatureFsrsDesc",
    tag: "FSRS",
  },
  {
    id: "srs",
    icon: Repeat2,
    label: "welcomeFeatureSrsLabel",
    description: "welcomeFeatureSrsDesc",
    tag: "SRS",
  },
  {
    id: "stats",
    icon: BarChart3,
    label: "welcomeFeatureStatsLabel",
    description: "welcomeFeatureStatsDesc",
    tag: "Stats",
  },
  {
    id: "decks",
    icon: Layers,
    label: "welcomeFeatureDecksLabel",
    description: "welcomeFeatureDecksDesc",
    tag: "Decks",
  },
  {
    id: "offline",
    icon: Zap,
    label: "welcomeFeatureOfflineLabel",
    description: "welcomeFeatureOfflineDesc",
    tag: "Offline",
  },
  {
    id: "pwa",
    icon: Smartphone,
    label: "welcomeFeaturePwaLabel",
    description: "welcomeFeaturePwaDesc",
    tag: "PWA",
  },
];

export const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
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
          {FEATURES.map((feature, i) => (
            <div
              key={feature.id}
              className={cn(
                "flex flex-col gap-3 border-border p-7 text-center md:text-left",
                i < FEATURES.length - 1 && "border-b",
                i % 2 === 0 && "md:border-r",
                i % 3 !== 2 && "lg:border-r",
                i >= FEATURES.length - 3 && "lg:border-b-0",
                i >= FEATURES.length - 2 && "md:border-b-0",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <feature.icon className="size-4 text-muted" />

                <span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-medium text-muted">
                  {t(feature.tag)}
                </span>
              </div>

              <h3 className="text-base font-semibold text-foreground">
                {t(feature.label)}
              </h3>

              <p className="text-sm leading-relaxed text-muted">
                {t(feature.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
