import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button, InputCounter, Skeleton, Text } from "@stellar-ui-kit/web";
import { useProfile, useUpdateProfile } from "@/hooks";

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
          value={goal}
          onChange={(v) => {
            setGoal(v);
            setDirty(true);
          }}
          min={1}
        />

        <Button
          type="button"
          disabled={!dirty || updateProfile.isPending}
          onClick={handleSave}
        >
          <Save />
          {t("settingsSave")}
        </Button>
      </div>
    </div>
  );
}
