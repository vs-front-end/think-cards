import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { Button, Card, Text } from "@stellar-ui-kit/web";
import { CheckCircle2, Flame } from "lucide-react";
import { db } from "@/lib/db";
import { useAuthStore } from "@/store";
import { computeStreak, formatTime } from "@/utils";
import type { StudyMode } from "@/hooks/useStudySession";

type CompletionScreenProps = {
  answeredCount: number;
  elapsedMs: number;
  dailyGoal: number;
  mode: StudyMode;
  onBack: () => void;
};

export const CompletionScreen = ({
  answeredCount,
  elapsedMs,
  dailyGoal,
  mode,
  onBack,
}: CompletionScreenProps) => {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id ?? "");
  const isPractice = mode === "practice";
  const goalMet = !isPractice && answeredCount >= dailyGoal;

  const streak = useLiveQuery(async () => {
    const revlogs = await db.revlog.where("user_id").equals(userId).toArray();
    return computeStreak(revlogs.map((r) => r.reviewed_at));
  }, [userId]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <Card className="flex w-full max-w-sm flex-col items-center gap-4 p-8 text-center">
        <CheckCircle2 className="size-12 text-success" />

        <div className="space-y-1">
          <Text as="h2" className="text-xl font-semibold">
            {t(isPractice ? "studyPracticeComplete" : "studySessionComplete")}
          </Text>

          {goalMet && (
            <Text as="p" className="text-sm text-success">
              {t("studyDailyGoalReached")}
            </Text>
          )}
        </div>

        {!isPractice && !!streak && streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-warning">
            <Flame className="size-4" />
            <Text as="span" className="text-sm font-medium text-warning">
              {t("studyStreakDays", { count: streak })}
            </Text>
          </div>
        )}

        <div className="flex w-full justify-around gap-4 border-t border-border pt-4">
          <div className="flex flex-col items-center gap-0.5">
            <Text as="span" className="text-2xl font-bold tabular-nums">
              {answeredCount}
            </Text>

            <Text as="span" className="text-xs text-muted">
              {t(isPractice ? "studyCardsPracticed" : "studyCardsReviewed")}
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
};
