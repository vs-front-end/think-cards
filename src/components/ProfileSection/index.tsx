import { useAuthStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  InputText,
  Skeleton,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

export function ProfileSection() {
  const fileRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useProfile();

  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();

  const [username, setUsername] = useState("");
  const [usernameDirty, setUsernameDirty] = useState(false);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile?.username]);

  const initials = (username || user?.email || "?").slice(0, 2).toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    try {
      await uploadAvatar.mutateAsync(file);
      toast.success(t("profileAvatarUpdated"));
    } catch {
      toast.error(t("profileAvatarError"));
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;

    try {
      await updateProfile.mutateAsync({ username: username.trim() });
      setUsernameDirty(false);
      toast.success(t("profileUsernameSaved"));
    } catch {
      toast.error(t("profileUsernameError"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-14 md:size-20">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <button
            type="button"
            aria-label="Change avatar"
            onClick={() => fileRef.current?.click()}
            disabled={uploadAvatar.isPending}
            className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border border-border bg-surface text-muted shadow disabled:opacity-60"
          >
            {uploadAvatar.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Camera className="size-4" />
            )}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex flex-1 flex-col truncate">
          <Text as="p" className="truncate text-sm md:text-lg font-semibold">
            {profile?.username || "—"}
          </Text>

          <Text as="p" className="truncate text-xs md:text-base text-muted">
            {user?.email}
          </Text>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <InputText
          label={t("settingsUsername")}
          value={username}
          onChange={(v) => {
            setUsername(v);
            setUsernameDirty(true);
          }}
        />

        <Button
          type="button"
          disabled={
            !usernameDirty || !username.trim() || updateProfile.isPending
          }
          onClick={handleSaveUsername}
        >
          {t("settingsSave")}
        </Button>
      </div>
    </div>
  );
}
