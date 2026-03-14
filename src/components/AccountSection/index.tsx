import { useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputText,
  Label,
  Separator,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

import { useDeleteAccount, useResetData, useSignOut } from "@/hooks";
import { useAuthStore } from "@/store";

export function AccountSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const deleteAccount = useDeleteAccount();
  const resetData = useResetData();
  const signOut = useSignOut();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      navigate({ to: "/" });
    } catch {
      toast.error(t("accountDeleteError"));
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

  return (
    <>
      <div className="flex flex-col gap-1">
        <Label>{t("settingsEmailLabel")}</Label>
        <Text as="p" className="truncate text-sm text-muted">
          {user?.email}
        </Text>
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
          size="sm"
          variant="outline"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {t("headerLogout")}
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 border border-dashed border-error rounded-lg p-3">
        <Text as="h3" className="text-lg font-bold text-error">
          {t("settingsDangerZone")}
        </Text>

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
            {t("settingsResetData")}
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
            {t("settingsDeleteAccount")}
          </Button>
        </div>
      </div>

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
    </>
  );
}
