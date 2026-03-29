import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useDeleteAccount, useResetData, useResetStats } from "@/hooks";
import { RefreshCw, Trash2 } from "lucide-react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputText,
  Separator,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  placeholder: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: () => void;
};

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  confirmLabel,
  isPending,
  onConfirm,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setValue("");
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-left">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2.5">
          <Text as="p" className="text-xs text-muted">
            {description}
          </Text>

          <InputText
            value={value}
            onChange={setValue}
            placeholder={placeholder}
            containerClassName="w-full max-w-full"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("settingsCancel")}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={value !== placeholder || isPending}
            onClick={onConfirm}
          >
            {isPending && <Spinner className="size-4 text-white" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DangerZone = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const deleteAccount = useDeleteAccount();
  const resetStats = useResetStats();
  const resetData = useResetData();

  const [resetStatsOpen, setResetStatsOpen] = useState(false);
  const [resetDataOpen, setResetDataOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleResetStats = async () => {
    try {
      await resetStats.mutateAsync();
      toast.success(t("settingsResetStatsSuccess"));
      setResetStatsOpen(false);
    } catch {
      toast.error(t("settingsResetStatsError"));
    }
  };

  const handleResetData = async () => {
    try {
      await resetData.mutateAsync();
      toast.success(t("settingsResetSuccess"));
      setResetDataOpen(false);
    } catch {
      toast.error(t("settingsResetError"));
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

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-error p-3">
        <Text as="h3" className="text-lg font-bold text-error">
          {t("settingsDangerZone")}
        </Text>

        <Separator className="bg-error" variant="dashed" />

        <div className="flex flex-col gap-3">
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
            className="w-full gap-2"
            onClick={() => setResetStatsOpen(true)}
          >
            <RefreshCw className="size-3.5" />
            {t("settingsResetStatsButton")}
          </Button>
        </div>

        <Separator className="bg-error" variant="dashed" />

        <div className="flex flex-col gap-3">
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
            className="w-full gap-2"
            onClick={() => setResetDataOpen(true)}
          >
            <RefreshCw className="size-3.5" />
            {t("settingsResetButton")}
          </Button>
        </div>

        <Separator className="bg-error" variant="dashed" />

        <div className="flex flex-col gap-3">
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
            className="w-full gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" />
            {t("settingsDeleteButton")}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={resetStatsOpen}
        onOpenChange={setResetStatsOpen}
        title={t("settingsResetStatsConfirmTitle")}
        description={t("settingsResetStatsConfirmDesc")}
        placeholder={t("settingsResetStatsConfirmPlaceholder")}
        confirmLabel={t("settingsResetStats")}
        isPending={resetStats.isPending}
        onConfirm={handleResetStats}
      />

      <ConfirmDialog
        open={resetDataOpen}
        onOpenChange={setResetDataOpen}
        title={t("settingsResetConfirmTitle")}
        description={t("settingsResetConfirmDesc")}
        placeholder={t("settingsResetConfirmPlaceholder")}
        confirmLabel={t("settingsResetData")}
        isPending={resetData.isPending}
        onConfirm={handleResetData}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("settingsDeleteConfirmTitle")}
        description={t("settingsDeleteConfirmDesc")}
        placeholder={t("accountDeleteConfirmPlaceholder")}
        confirmLabel={t("settingsDelete")}
        isPending={deleteAccount.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
};
