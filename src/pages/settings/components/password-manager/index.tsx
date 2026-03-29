import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { useAuthStore } from "@/store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useChangePassword, useSetPassword } from "@/hooks";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputPassword,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

const PASSWORD_REQUIREMENTS = [
  /.{8,}/,
  /[a-z]/,
  /[A-Z]/,
  /[0-9]/,
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
];

const PasswordManagerDialog = ({
  open,
  onClose,
  identityId,
}: {
  open: boolean;
  onClose: () => void;
  identityId: string;
}) => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const setPassword = useSetPassword();
  const changePassword = useChangePassword();

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
    error: "",
  });

  const handleFormChange = (key: keyof typeof passwordForm, value: string) => {
    setPasswordForm((p) => ({ ...p, [key]: value }));
  };

  const handleSetPassword = async () => {
    handleFormChange("error", "");

    const meetsRequirements = PASSWORD_REQUIREMENTS.every((re) =>
      re.test(passwordForm.next),
    );

    if (!meetsRequirements) {
      handleFormChange("error", t("changePasswordErrorRequirements"));
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      handleFormChange("error", t("changePasswordErrorMismatch"));
      return;
    }

    try {
      await setPassword.mutateAsync({ newPassword: passwordForm.next });

      onClose();
      toast.success(t("addPasswordSuccess"));
      handleFormChange("error", t("changePasswordErrorGeneric"));
    } catch {
      handleFormChange("error", t("changePasswordErrorGeneric"));
    }
  };

  const handleChangePassword = async () => {
    handleFormChange("error", "");

    if (!passwordForm.current) {
      handleFormChange("error", t("changePasswordErrorCurrentRequired"));
      return;
    }

    const meetsRequirements = PASSWORD_REQUIREMENTS.every((re) =>
      re.test(passwordForm.next),
    );

    if (!meetsRequirements) {
      handleFormChange("error", t("changePasswordErrorRequirements"));
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      handleFormChange("error", t("changePasswordErrorMismatch"));
      return;
    }

    try {
      await changePassword.mutateAsync({
        email: user?.email ?? "",
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });

      onClose();
      toast.success(t("changePasswordSuccess"));
      handleFormChange("error", t("changePasswordErrorGeneric"));
    } catch (err) {
      if (err instanceof Error && err.message === "wrongCurrentPassword") {
        handleFormChange("error", t("changePasswordErrorWrongCurrent"));
      } else {
        handleFormChange("error", t("changePasswordErrorGeneric"));
      }
    }
  };

  useEffect(() => {
    if (open) return;
    setPasswordForm({ current: "", next: "", confirm: "", error: "" });
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleFormChange("error", "");
        onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-left">
          <DialogTitle>
            {t(identityId ? "changePasswordTitle" : "addPasswordTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {identityId && (
            <div className="flex flex-col gap-1.5">
              <InputPassword
                label={t("changePasswordCurrentLabel")}
                value={passwordForm.current}
                onChange={(v) => {
                  setPasswordForm((p) => ({ ...p, current: v }));
                  handleFormChange("error", "");
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
                handleFormChange("error", "");
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
                handleFormChange("error", "");
              }}
              placeholder="••••••••"
              containerClassName="w-full max-w-full"
            />
          </div>

          {passwordForm.error && (
            <Text as="p" className="text-xs text-error">
              {passwordForm.error}
            </Text>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              handleFormChange("error", "");
              onClose();
            }}
            disabled={changePassword.isPending || setPassword.isPending}
          >
            {t("settingsCancel")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={identityId ? handleChangePassword : handleSetPassword}
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
  );
};

export const PasswordManager = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const emailId = user?.identities?.find((id) => id.provider === "email")?.id;

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const togglePasswordModal = () => setIsPasswordModalOpen((isOpen) => !isOpen);

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Text as="p" className="text-sm font-semibold">
            {t(emailId ? "changePasswordTitle" : "addPasswordTitle")}
          </Text>
          <Text as="p" className="text-xs text-muted">
            {t(emailId ? "changePasswordDesc" : "addPasswordDesc")}
          </Text>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full text-muted"
          onClick={togglePasswordModal}
        >
          <KeyRound className="size-4" />
          {t(emailId ? "changePasswordButton" : "addPasswordButton")}
        </Button>
      </div>

      <PasswordManagerDialog
        open={isPasswordModalOpen}
        onClose={togglePasswordModal}
        identityId={emailId ?? ""}
      />
    </>
  );
};
