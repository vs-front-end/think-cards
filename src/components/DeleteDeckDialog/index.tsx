import { useTranslation } from "react-i18next";
import { useDeleteDeck } from "@/hooks";
import type { IDeck } from "@/lib/db";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Text,
} from "@stellar-ui-kit/web";

type IDeleteDeckDialogProps = {
  deck: IDeck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteDeckDialog({
  deck,
  open,
  onOpenChange,
}: IDeleteDeckDialogProps) {
  const { t } = useTranslation();
  const deleteDeck = useDeleteDeck();

  const handleConfirm = () => {
    deleteDeck.mutate(deck.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90dvh] w-full max-w-[calc(100%-2rem)] flex flex-col overflow-hidden sm:max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>{t("deleteDeckTitle")}</DialogTitle>
        </DialogHeader>

        <Text as="p" className="text-sm text-muted">
          {t("deleteDeckMessage")}{" "}
          <span className="font-semibold text-foreground">{deck.name}</span>
          {t("deleteDeckConfirm")}
        </Text>

        <DialogFooter>
          <Button
            variant="ghost"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={deleteDeck.isPending}
          >
            {t("deleteDeckCancel")}
          </Button>
          
          <Button
            variant="destructive"
            type="button"
            onClick={handleConfirm}
            disabled={deleteDeck.isPending}
          >
            {t("deleteDeckConfirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
