import { useTranslation } from "react-i18next";
import { Button, Card, Text } from "@stellar-ui-kit/web";
import { CheckCircle2 } from "lucide-react";
import { formatTime } from "@/utils/format";

type CompletionScreenProps = {
  answeredCount: number;
  elapsedMs: number;
  dailyGoal: number;
  onBack: () => void;
};

export function CompletionScreen({
  answeredCount,
  elapsedMs,
  dailyGoal,
  onBack,
}: CompletionScreenProps) {
  const { t } = useTranslation();
  const goalMet = answeredCount >= dailyGoal;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <Card className="flex w-full max-w-sm flex-col items-center gap-4 p-8 text-center">
        <CheckCircle2 className="size-12 text-success" />

        <div className="space-y-1">
          <Text as="h2" className="text-xl font-semibold">
            {t("studySessionComplete")}
          </Text>

          {goalMet && (
            <Text as="p" className="text-sm text-success">
              {t("studyDailyGoalReached")}
            </Text>
          )}
        </div>

        <div className="flex w-full justify-around gap-4 border-t border-border pt-4">
          <div className="flex flex-col items-center gap-0.5">
            <Text as="span" className="text-2xl font-bold tabular-nums">
              {answeredCount}
            </Text>
            
            <Text as="span" className="text-xs text-muted">
              {t("studyCardsReviewed")}
            </Text>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <Text as="span" className="text-2xl font-bold tabular-nums">
              {formatTime(elapsedMs)}
            </Text>

            <Text as="span" className="text-xs text-muted">
              {t("studyTimeSpent")}
            </Text>
          </div>
        </div>

        <Button type="button" className="w-full" onClick={onBack}>
          {t("studyBackToDashboard")}
        </Button>
      </Card>
    </div>
  );
}
