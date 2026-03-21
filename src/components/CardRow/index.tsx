import DOMPurify from "dompurify";
import { cn } from "@stellar-ui-kit/shared";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import type { CardWithState, CardStatus } from "@/hooks/useCardsWithState";
import { truncate } from "@/utils/format";

import {
  Checkbox,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stellar-ui-kit/web";

function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

type CardRowProps = {
  card: CardWithState;
  selected: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function CardRow({
  card,
  selected,
  onToggle,
  onEdit,
  onDelete,
}: CardRowProps) {
  const { t } = useTranslation();
  const front = stripHtml(card.front);

  const statusLabel = (status: CardStatus): string => {
    const map: Record<CardStatus, string> = {
      new: t("cardRowStatusNew"),
      learning: t("cardRowStatusLearning"),
      review: t("cardRowStatusReview"),
    };

    return map[status];
  };

  const typeLabel = (type: CardWithState["type"]): string => {
    const map: Record<CardWithState["type"], string> = {
      basic: t("cardRowTypeBasic"),
      cloze: t("cardRowTypeCloze"),
      typing: t("cardRowTypeTyping"),
    };

    return map[type];
  };

  const formatDue = (due: string | null): string => {
    if (!due) return "—";
    const d = new Date(due);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return t("cardRowOverdue");
    if (diff === 0) return t("cardRowToday");
    if (diff === 1) return t("cardRowTomorrow");
    return t("cardRowInDays", { count: diff });
  };

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3 shadow-sm transition-colors md:px-4">
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle(card.id)}
        className="mt-0.5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <Text as="p" className="text-sm">
          {truncate(front, 180) || "—"}
        </Text>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>
            {t("cardRowLabelStatus")}:{" "}
            <span className="text-foreground">{statusLabel(card.status)}</span>
          </span>

          <span>
            {t("cardRowLabelType")}:{" "}
            <span className="text-foreground">{typeLabel(card.type)}</span>
          </span>

          <span>
            {t("cardRowLabelNextReview")}:{" "}
            <span className="text-foreground">{formatDue(card.due)}</span>
          </span>
        </div>
      </div>

      <TooltipProvider>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Edit card"
                onClick={() => onEdit(card.id)}
                className="flex size-7 items-center justify-center rounded text-muted hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </button>
            </TooltipTrigger>

            <TooltipContent className="bg-foreground">
              <Text as="span" className="text-xs text-background font-medium">
                {t("cardModalEditTitle")}
              </Text>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Delete card"
                onClick={() => onDelete(card.id)}
                className="flex size-7 items-center justify-center rounded text-muted hover:text-foreground"
              >
                <Trash2 className="size-3.5" />
              </button>
            </TooltipTrigger>

            <TooltipContent className="bg-foreground">
              <Text as="span" className="text-xs text-background font-medium">
                {t("deleteCardTitle")}
              </Text>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
