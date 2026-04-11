import { toast } from "sonner";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfile, useUpdateProfile } from "@/hooks";

import {
  Button,
  InputText,
  Skeleton,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

export const ProfileUsername = () => {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const { data: profile, isLoading } = useProfile();

  const [username, setUsername] = useState(profile?.username ?? "");

  const handleSaveUsername = async () => {
    if (!username.trim()) return;

    try {
      await updateProfile.mutateAsync({ username: username.trim() });
      toast.success(t("profileUsernameSaved"));
    } catch {
      toast.error(t("profileUsernameError"));
    }
  };

  useEffect(() => {
    if (!profile?.username) return;
    setUsername(profile.username ?? "");
  }, [profile?.username]);

  if (isLoading) return <Skeleton className="h-12 w-full rounded-md" />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text as="p" className="text-sm font-semibold">
          {t("settingsUsername")}
        </Text>
        <Text as="p" className="text-xs text-muted">
          {t("settingsUsernameDesc")}
        </Text>
      </div>

      <div className="flex items-center gap-2">
        <InputText
          value={username}
          onChange={(v) => {
            setUsername(v);
          }}
        />

        <Button
          type="button"
          disabled={!username.trim() || updateProfile.isPending}
          onClick={handleSaveUsername}
        >
          {updateProfile.isPending ? (
            <Spinner className="size-4 text-white" />
          ) : (
            <Save className="size-4" />
          )}

          {t("settingsSave")}
        </Button>
      </div>
    </div>
  );
};
