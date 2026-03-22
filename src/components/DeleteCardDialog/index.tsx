import { useTranslation } from "react-i18next";
import { useDeleteCard } from "@/hooks";
import type { ICard } from "@/lib/db";
import { truncate } from "@/utils/format";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Text,
} from "@stellar-ui-kit/web";

type IDeleteCardDialogProps = {
  card: ICard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteCardDialog({
  card,
  open,
  onOpenChange,
}: IDeleteCardDialogProps) {
  const { t } = useTranslation();
  const deleteCard = useDeleteCard();

  const handleConfirm = () => {
    deleteCard.mutate(card.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const preview = truncate(card.front.replace(/<[^>]*>/g, ""), 60);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90dvh] w-full max-w-[calc(100%-2rem)] flex flex-col overflow-hidden sm:max-w-sm"
      >
        <DialogHeader className="text-left">
          <DialogTitle>{t("deleteCardTitle")}</DialogTitle>
        </DialogHeader>

        <Text as="p" className="text-sm text-muted">
          {t("deleteCardMessage")}
          {preview && (
            <>
              {" "}
              <span className="font-medium text-foreground">
                &ldquo;{preview}&rdquo;
              </span>
            </>
          )}
        </Text>

        <DialogFooter>
          <Button
            variant="ghost"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={deleteCard.isPending}
          >
            {t("settingsCancel")}
          </Button>

          <Button
            variant="destructive"
            type="button"
            onClick={handleConfirm}
            disabled={deleteCard.isPending}
          >
            {t("settingsDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
