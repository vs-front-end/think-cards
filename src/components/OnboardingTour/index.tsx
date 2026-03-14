import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Text } from "@stellar-ui-kit/web";
import { Layers, BookOpen, Play, X } from "lucide-react";

const STORAGE_KEY = "onboarding_done";

type IOnboardingTourProps = {
  onDone: () => void;
};

export function OnboardingTour({ onDone }: IOnboardingTourProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const STEPS = [
    {
      icon: Layers,
      title: t("onboardingCreateDeckTitle"),
      description: t("onboardingCreateDeckDesc"),
    },
    {
      icon: BookOpen,
      title: t("onboardingAddCardTitle"),
      description: t("onboardingAddCardDesc"),
    },
    {
      icon: Play,
      title: t("onboardingStartStudyTitle"),
      description: t("onboardingStartStudyDesc"),
    },
  ];

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    onDone();
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 p-4 backdrop-blur-sm sm:items-center">
      <Card className="relative w-full max-w-sm border border-border bg-surface p-6 shadow-xl">
        <button
          type="button"
          onClick={finish}
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted/20 hover:text-foreground"
          aria-label="Skip tour"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="size-6" />
          </div>

          <div className="space-y-1">
            <Text as="p" className="text-xs font-medium text-muted">
              {t("onboardingStep", { current: step + 1, total: STEPS.length })}
            </Text>

            <Text as="h3" className="text-lg font-semibold">
              {current.title}
            </Text>

            <Text as="p" className="text-sm text-muted">
              {current.description}
            </Text>
          </div>

          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-4 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex w-full gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={finish}
              className="flex-1"
            >
              {t("onboardingSkip")}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (isLast) {
                  finish();
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className="flex-1"
            >
              {isLast ? t("onboardingGotIt") : t("onboardingNext")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
