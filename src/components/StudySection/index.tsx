import { useEffect, useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Button,
  InputCounter,
  Label,
  Skeleton,
  Text,
} from "@stellar-ui-kit/web";

export function StudySection() {
  const { t } = useTranslation();

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [goal, setGoal] = useState(20);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile?.daily_goal_default) setGoal(profile.daily_goal_default);
  }, [profile?.daily_goal_default]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ daily_goal_default: goal });
      setDirty(false);
      toast.success(t("studyGoalSaved"));
    } catch {
      toast.error(t("studyGoalError"));
    }
  };

  if (isLoading)
    return <Skeleton className="h-12 w-full max-w-xl rounded-md" />;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label>{t("settingsDefaultGoal")}</Label>
          <Text as="p" className="text-xs text-muted">
            {t("settingsDefaultGoalDesc")}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full md:w-48">
            <InputCounter
              value={goal}
              onChange={(v) => {
                setGoal(v);
                setDirty(true);
              }}
              min={1}
            />
          </div>

          <Button
            type="button"
            disabled={!dirty || updateProfile.isPending}
            onClick={handleSave}
          >
            {t("settingsSave")}
          </Button>
        </div>
      </div>
    </div>
  );
}
