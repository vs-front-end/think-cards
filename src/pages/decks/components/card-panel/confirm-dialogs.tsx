import { useTranslation } from "react-i18next";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Text,
} from "@stellar-ui-kit/web";

type ConfirmDialogsProps = {
  bulkDeleteOpen: boolean;
  bulkMoveOpen: boolean;
  selectedCount: number;
  bulkDeleteIsPending: boolean;
  moveIsPending: boolean;
  onBulkDeleteOpenChange: (open: boolean) => void;
  onBulkMoveOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  onConfirmMove: () => void;
};

export const ConfirmDialogs = ({
  bulkDeleteOpen,
  bulkMoveOpen,
  selectedCount,
  bulkDeleteIsPending,
  moveIsPending,
  onBulkDeleteOpenChange,
  onBulkMoveOpenChange,
  onConfirmDelete,
  onConfirmMove,
}: ConfirmDialogsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Dialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          if (!bulkDeleteIsPending) onBulkDeleteOpenChange(open);
        }}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader className="text-left">
            <DialogTitle>{t("cardPanelDelete")}</DialogTitle>
          </DialogHeader>

          <Text as="p" className="text-sm text-muted">
            {t("cardPanelConfirmBulkDelete", { count: selectedCount })}
          </Text>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onBulkDeleteOpenChange(false)}
              disabled={bulkDeleteIsPending}
            >
              {t("settingsCancel")}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={bulkDeleteIsPending}
            >
              {t("cardPanelDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bulkMoveOpen}
        onOpenChange={(open) => {
          if (!moveIsPending) onBulkMoveOpenChange(open);
        }}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader className="text-left">
            <DialogTitle>{t("cardPanelMove")}</DialogTitle>
          </DialogHeader>

          <Text as="p" className="text-sm text-muted">
            {t("cardPanelConfirmBulkMove", { count: selectedCount })}
          </Text>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onBulkMoveOpenChange(false)}
              disabled={moveIsPending}
            >
              {t("settingsCancel")}
            </Button>

            <Button
              type="button"
              onClick={onConfirmMove}
              disabled={moveIsPending}
            >
              {t("cardPanelMove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
