import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Camera, KeyRound, LogOut, Save } from "lucide-react";
import { useAuthStore } from "@/store";
import { createImageUrl } from "@/utils";
import { AvatarCropDialog } from "../AvatarCropDialog";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputPassword,
  InputText,
  Separator,
  Skeleton,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

import {
  useChangePassword,
  useDeleteAccount,
  useProfile,
  useResetData,
  useResetStats,
  useSetPassword,
  useSignOut,
  useUpdateProfile,
  useUploadAvatar,
} from "@/hooks";

export function AccountSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useProfile();

  const hasPasswordProvider =
    user?.identities?.some((identity) => identity.provider === "email") ??
    false;

  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const changePassword = useChangePassword();
  const setPassword = useSetPassword();
  const resetStats = useResetStats();
  const resetData = useResetData();
  const signOut = useSignOut();

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [usernameDirty, setUsernameDirty] = useState(false);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [resetStatsOpen, setResetStatsOpen] = useState(false);
  const [resetStatsConfirmText, setResetStatsConfirmText] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile?.username]);

  const initials = (username || user?.email || "?").slice(0, 2).toUpperCase();

  const PASSWORD_REQUIREMENTS = [
    /.{8,}/,
    /[a-z]/,
    /[A-Z]/,
    /[0-9]/,
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error(t("profileAvatarTooLarge"));
      return;
    }

    setCropImageSrc(createImageUrl(file));
    setCropOpen(true);
  };

  const handleCropConfirm = async (croppedFile: File) => {
    try {
      await uploadAvatar.mutateAsync(croppedFile);
      toast.success(t("profileAvatarUpdated"));
    } catch (err) {
      const message =
        err instanceof Error && err.message?.includes("size")
          ? t("profileAvatarTooLarge")
          : t("profileAvatarError");

      toast.error(message);
    } finally {
      closeCropDialog();
    }
  };

  const closeCropDialog = () => {
    setCropOpen(false);
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
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

  const handleSetPassword = async () => {
    setPasswordError("");

    const meetsRequirements = PASSWORD_REQUIREMENTS.every((re) =>
      re.test(passwordForm.next),
    );

    if (!meetsRequirements) {
      setPasswordError(t("changePasswordErrorRequirements"));
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError(t("changePasswordErrorMismatch"));
      return;
    }

    try {
      await setPassword.mutateAsync({ newPassword: passwordForm.next });
      toast.success(t("addPasswordSuccess"));
      setChangePasswordOpen(false);
    } catch {
      setPasswordError(t("changePasswordErrorGeneric"));
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");

    if (!passwordForm.current) {
      setPasswordError(t("changePasswordErrorCurrentRequired"));
      return;
    }

    const meetsRequirements = PASSWORD_REQUIREMENTS.every((re) =>
      re.test(passwordForm.next),
    );

    if (!meetsRequirements) {
      setPasswordError(t("changePasswordErrorRequirements"));
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError(t("changePasswordErrorMismatch"));
      return;
    }

    try {
      await changePassword.mutateAsync({
        email: user?.email ?? "",
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });

      toast.success(t("changePasswordSuccess"));
      setChangePasswordOpen(false);
    } catch (err) {
      if (err instanceof Error && err.message === "wrongCurrentPassword") {
        setPasswordError(t("changePasswordErrorWrongCurrent"));
      } else {
        setPasswordError(t("changePasswordErrorGeneric"));
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      navigate({ to: "/" });
    } catch {
      toast.error(t("accountDeleteError"));
    }
  };

  const handleResetStats = async () => {
    try {
      await resetStats.mutateAsync();
      toast.success(t("settingsResetStatsSuccess"));
      setResetStatsOpen(false);
    } catch {
      toast.error(t("settingsResetStatsError"));
    }
  };

  const handleReset = async () => {
    try {
      await resetData.mutateAsync();
      toast.success(t("settingsResetSuccess"));
      setResetOpen(false);
    } catch {
      toast.error(t("settingsResetError"));
    }
  };

  const handleLogout = () => {
    signOut().then(() => navigate({ to: "/" }));
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
    <>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-20">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <button
            type="button"
            aria-label="Change avatar"
            onClick={() => fileRef.current?.click()}
            disabled={uploadAvatar.isPending}
            className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-white/80 shadow disabled:opacity-60"
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
          <Text as="p" className="truncate text-sm font-semibold md:text-lg">
            {profile?.username || "—"}
          </Text>

          <Text as="p" className="truncate text-xs text-muted md:text-base">
            {user?.email}
          </Text>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
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
            <Save className="size-4" />
            {t("settingsSave")}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Text as="p" className="text-sm font-semibold">
            {t("settingsEmailLabel")}
          </Text>
          <Text as="p" className="truncate text-xs text-muted">
            {user?.email}
          </Text>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Text as="p" className="text-sm font-semibold">
            {t(
              hasPasswordProvider ? "changePasswordTitle" : "addPasswordTitle",
            )}
          </Text>
          <Text as="p" className="text-xs text-muted">
            {t(hasPasswordProvider ? "changePasswordDesc" : "addPasswordDesc")}
          </Text>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full md:w-36"
          onClick={() => {
            setPasswordForm({ current: "", next: "", confirm: "" });
            setPasswordError("");
            setChangePasswordOpen(true);
          }}
        >
          <KeyRound className="size-4" />
          {t(
            hasPasswordProvider ? "changePasswordButton" : "addPasswordButton",
          )}
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Text as="p" className="text-sm font-semibold">
            {t("settingsSectionSession")}
          </Text>
          <Text as="p" className="text-xs text-muted">
            {t("settingsSessionDesc")}
          </Text>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          className="w-full md:w-36"
        >
          <LogOut className="size-4" />
          {t("headerLogout")}
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-error p-3">
        <Text as="h3" className="text-lg font-bold text-error">
          {t("settingsDangerZone")}
        </Text>

        <Separator className="bg-error" variant="dashed" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Text as="p" className="text-sm font-semibold">
              {t("settingsResetStats")}
            </Text>
            <Text as="p" className="text-xs text-muted">
              {t("settingsResetStatsDesc")}
            </Text>
          </div>

          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="w-full md:w-32"
            onClick={() => {
              setResetStatsConfirmText("");
              setResetStatsOpen(true);
            }}
          >
            {t("settingsResetStatsButton")}
          </Button>
        </div>

        <Separator className="bg-error" variant="dashed" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Text as="p" className="text-sm font-semibold">
              {t("settingsResetData")}
            </Text>
            <Text as="p" className="text-xs text-muted">
              {t("settingsResetDataDesc")}
            </Text>
          </div>

          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="w-full md:w-32"
            onClick={() => {
              setResetConfirmText("");
              setResetOpen(true);
            }}
          >
            {t("settingsResetButton")}
          </Button>
        </div>

        <Separator className="bg-error" variant="dashed" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Text as="p" className="text-sm font-semibold">
              {t("settingsDeleteAccount")}
            </Text>
            <Text as="p" className="text-xs text-muted">
              {t("settingsDeleteAccountDesc")}
            </Text>
          </div>

          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="w-full md:w-32"
            onClick={() => {
              setConfirmText("");
              setConfirmOpen(true);
            }}
          >
            {t("settingsDeleteButton")}
          </Button>
        </div>
      </div>

      <Dialog
        open={changePasswordOpen}
        onOpenChange={(open) => {
          setChangePasswordOpen(open);
          if (!open) setPasswordError("");
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t(
                hasPasswordProvider
                  ? "changePasswordTitle"
                  : "addPasswordTitle",
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {hasPasswordProvider && (
              <div className="flex flex-col gap-1.5">
                <InputPassword
                  label={t("changePasswordCurrentLabel")}
                  value={passwordForm.current}
                  onChange={(v) => {
                    setPasswordForm((p) => ({ ...p, current: v }));
                    setPasswordError("");
                  }}
                  placeholder="••••••••"
                  containerClassName="w-full max-w-full"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <InputPassword
                label={t("changePasswordNewLabel")}
                value={passwordForm.next}
                onChange={(v) => {
                  setPasswordForm((p) => ({ ...p, next: v }));
                  setPasswordError("");
                }}
                placeholder="••••••••"
                containerClassName="w-full max-w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <InputPassword
                label={t("changePasswordConfirmLabel")}
                value={passwordForm.confirm}
                onChange={(v) => {
                  setPasswordForm((p) => ({ ...p, confirm: v }));
                  setPasswordError("");
                }}
                placeholder="••••••••"
                containerClassName="w-full max-w-full"
              />
            </div>

            {passwordError && (
              <Text as="p" className="text-xs text-error">
                {passwordError}
              </Text>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setChangePasswordOpen(false)}
              disabled={changePassword.isPending || setPassword.isPending}
            >
              {t("settingsCancel")}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={
                hasPasswordProvider ? handleChangePassword : handleSetPassword
              }
              disabled={changePassword.isPending || setPassword.isPending}
            >
              {(changePassword.isPending || setPassword.isPending) && (
                <Spinner className="size-4 text-white" />
              )}

              {t("changePasswordSave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetStatsOpen} onOpenChange={setResetStatsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("settingsResetStatsConfirmTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2.5">
            <Text as="p" className="text-xs text-muted">
              {t("settingsResetStatsConfirmDesc")}
            </Text>

            <InputText
              value={resetStatsConfirmText}
              onChange={setResetStatsConfirmText}
              placeholder={t("settingsResetStatsConfirmPlaceholder")}
              containerClassName="w-full max-w-full"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setResetStatsOpen(false)}
              disabled={resetStats.isPending}
            >
              {t("settingsCancel")}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={
                resetStatsConfirmText !==
                  t("settingsResetStatsConfirmPlaceholder") ||
                resetStats.isPending
              }
              onClick={handleResetStats}
            >
              {resetStats.isPending && (
                <Spinner className="size-4 text-white" />
              )}
              {t("settingsResetStats")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("settingsResetConfirmTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2.5">
            <Text as="p" className="text-xs text-muted">
              {t("settingsResetConfirmDesc")}
            </Text>

            <InputText
              value={resetConfirmText}
              onChange={setResetConfirmText}
              placeholder={t("settingsResetConfirmPlaceholder")}
              containerClassName="w-full max-w-full"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setResetOpen(false)}
              disabled={resetData.isPending}
            >
              {t("settingsCancel")}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={
                resetConfirmText !== t("settingsResetConfirmPlaceholder") ||
                resetData.isPending
              }
              onClick={handleReset}
            >
              {resetData.isPending && <Spinner className="size-4 text-white" />}
              {t("settingsResetData")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("settingsDeleteConfirmTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2.5">
            <Text as="p" className="text-xs text-muted">
              {t("settingsDeleteConfirmDesc")}
            </Text>

            <InputText
              value={confirmText}
              onChange={setConfirmText}
              placeholder={t("accountDeleteConfirmPlaceholder")}
              containerClassName="w-full max-w-full"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmOpen(false)}
              disabled={deleteAccount.isPending}
            >
              {t("settingsCancel")}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={
                confirmText !== t("accountDeleteConfirmPlaceholder") ||
                deleteAccount.isPending
              }
              onClick={handleDelete}
            >
              {deleteAccount.isPending && (
                <Spinner className="size-4 text-white" />
              )}
              {t("settingsDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AvatarCropDialog
        open={cropOpen}
        imageSrc={cropImageSrc}
        isPending={uploadAvatar.isPending}
        onConfirm={handleCropConfirm}
        onCancel={closeCropDialog}
      />
    </>
  );
}
