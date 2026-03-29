import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquarePlus } from "lucide-react";
import { Button, Text } from "@stellar-ui-kit/web";
import { FeedbackModal } from "@/components";

export const FeedbackSection = () => {
  const { t } = useTranslation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text as="p" className="text-sm font-semibold">
          {t("navFeedback")}
        </Text>
        <Text as="p" className="text-xs text-muted">
          {t("feedbackDesc")}
        </Text>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setFeedbackOpen(true)}
        className="w-full gap-2 text-muted"
      >
        <MessageSquarePlus className="size-4" />
        {t("feedbackTitle")}
      </Button>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};
