import { toast } from "sonner";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfile, useUpdateProfile } from "@/hooks";

import {
  Button,
  InputCounter,
  Skeleton,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

export const ProfileDailyGoal = () => {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const { data: profile, isLoading } = useProfile();

  const [dailyGoal, setDailyGoal] = useState(profile?.daily_goal_default ?? 0);

  const handleSaveDailyGoal = async () => {
    if (!dailyGoal) return;

    try {
      await updateProfile.mutateAsync({ daily_goal_default: dailyGoal });
      toast.success(t("studyGoalSaved"));
    } catch {
      toast.error(t("studyGoalError"));
    }
  };

  useEffect(() => {
    if (!profile?.daily_goal_default) return;
    setDailyGoal(profile.daily_goal_default ?? 0);
  }, [profile?.daily_goal_default]);

  if (isLoading) return <Skeleton className="h-12 w-full rounded-md" />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text as="p" className="text-sm font-semibold">
          {t("settingsSectionStudy")}
        </Text>
        <Text as="p" className="text-xs text-muted">
          {t("settingsDefaultGoalDesc")}
        </Text>
      </div>

      <div className="flex flex-1 items-center gap-2">
        <InputCounter
          value={dailyGoal}
          onChange={(v) => setDailyGoal(v)}
          min={1}
          containerClassName="w-full max-w-full"
        />

        <Button
          type="button"
          disabled={!dailyGoal || updateProfile.isPending}
          onClick={handleSaveDailyGoal}
        >
          {updateProfile.isPending ? (
            <Spinner className="size-4 text-white" />
          ) : (
            <Save />
          )}

          {t("settingsSave")}
        </Button>
      </div>
    </div>
  );
};
