import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCategory("suggestion");
    setMessage("");
    setSent(false);
    setError("");
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setSending(true);
    setError("");

    const { error: fnError } = await supabase.functions.invoke(
      "send-feedback-email",
      { body: { category, message: message.trim() } },
    );

    setSending(false);

    if (fnError) {
      setError(t("feedbackError"));
      return;
    }

    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>{t("feedbackTitle")}</DialogTitle>
        </DialogHeader>

        {sent ? (
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

            {error && (
              <div className="rounded-md bg-error-soft px-4 py-3">
                <Text as="p" className="text-sm text-error-text">
                  {error}
                </Text>
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit}
              disabled={sending || !message.trim()}
            >
              {sending && <Spinner className="size-4 text-white" />}
              {t("feedbackSubmit")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
