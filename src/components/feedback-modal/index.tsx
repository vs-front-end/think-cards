import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSendFeedback } from "@/hooks";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Text,
  TextArea,
} from "@stellar-ui-kit/web";

type FeedbackCategory = "bug" | "suggestion" | "other";

type FeedbackModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { t } = useTranslation();

  const [category, setCategory] = useState<FeedbackCategory>("suggestion");
  const [message, setMessage] = useState("");

  const { mutate, isPending, isSuccess, isError, reset } = useSendFeedback();

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setCategory("suggestion");
      setMessage("");
      reset();
    }
  };

  const handleSubmit = () => {
    if (!message.trim()) return;
    mutate({ category, message });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>{t("feedbackTitle")}</DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4 py-2">
            <Text as="p" className="text-sm text-foreground">
              {t("feedbackSuccess")}
            </Text>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOpenChange(false)}
            >
              {t("feedbackClose")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Text as="span" className="text-sm font-medium text-foreground">
                {t("feedbackCategoryLabel")}
              </Text>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as FeedbackCategory)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">
                    {t("feedbackCategoryBug")}
                  </SelectItem>
                  <SelectItem value="suggestion">
                    {t("feedbackCategorySuggestion")}
                  </SelectItem>
                  <SelectItem value="other">
                    {t("feedbackCategoryOther")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Text as="span" className="text-sm font-medium text-foreground">
                {t("feedbackMessageLabel")}
              </Text>
              <TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedbackMessagePlaceholder")}
                rows={5}
                className="resize-none"
              />
            </div>

            {isError && (
              <div className="rounded-md bg-error-soft px-4 py-3">
                <Text as="p" className="text-sm text-error-text">
                  {t("feedbackError")}
                </Text>
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit}
              disabled={isPending || !message.trim()}
            >
              {isPending && <Spinner className="size-4 text-white" />}
              {t("feedbackSubmit")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
