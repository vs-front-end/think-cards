import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSendFeedback } from "@/hooks";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Text,
  TextArea,
} from "@stellar-ui-kit/web";

type OnboardingSurveyProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const REASON_KEYS = [
  "exams",
  "languages",
  "school_work",
  "exploring",
  "other",
] as const;

type ReasonKey = (typeof REASON_KEYS)[number];

export const OnboardingSurvey = ({
  open,
  onOpenChange,
}: OnboardingSurveyProps) => {
  const { t } = useTranslation();
  const { mutate } = useSendFeedback();

  const [reason, setReason] = useState<ReasonKey | "">("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!reason) return;

    const reasonLabel = t(`onboardingSurveyReason_${reason}`);
    const message = note.trim()
      ? `Motivo: ${reasonLabel}\n\n${note.trim()}`
      : `Motivo: ${reasonLabel}`;

    mutate({ category: "other", message });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>{t("onboardingSurveyTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <RadioGroup
            value={reason}
            onValueChange={(v) => setReason(v as ReasonKey)}
            className="flex flex-col gap-2.5"
          >
            {REASON_KEYS.map((key) => (
              <Label
                key={key}
                className="flex items-center gap-2.5 text-sm font-normal text-foreground"
              >
                <RadioGroupItem value={key} />
                {t(`onboardingSurveyReason_${key}`)}
              </Label>
            ))}
          </RadioGroup>

          <div className="flex flex-col gap-2">
            <Text as="span" className="text-sm font-medium text-foreground">
              {t("onboardingSurveyNoteLabel")}
            </Text>
            <TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("onboardingSurveyNotePlaceholder")}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("onboardingSurveySkip")}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={!reason}>
              {t("onboardingSurveySubmit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
