import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { useNavigateToStudy } from "@/hooks";
import { ChevronDown, MoreVertical, Pencil, Play, Trash2 } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
} from "@stellar-ui-kit/web";

export type DeckCardSubdeck = {
  id: string;
  name: string;
  new: number;
  learning: number;
  review: number;
};

export type DeckCard = {
  id: string;
  name: string;
  new: number;
  learning: number;
  review: number;
  children?: DeckCardSubdeck[];
};

type DeckCardProps = {
  deck: DeckCard;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const useLocalExpanded = (deckId: string) => {
  const key = `deck_expanded_${deckId}`;

  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  });

  const toggle = useCallback(
    (next: boolean) => {
      setOpen(next);
      try {
        localStorage.setItem(key, String(next));
      } catch {}
    },
    [key],
  );

  return [open, toggle] as const;
};

const CardCounts = ({
  newCount,
  learning,
  review,
}: {
  newCount: number;
  learning: number;
  review: number;
}) => {
  const { t } = useTranslation();
  const total = newCount + learning + review;

  if (total === 0) {
    return (
      <Text as="span" styleVariant="muted" className="text-sm">
        {t("deckNoCardsDue")}
      </Text>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-primary-soft text-primary-text">
        {newCount} {t("deckNew")}
      </Badge>

      <Badge variant="destructive">
        {learning} {t("deckLearning")}
      </Badge>

      <Badge variant="success">
        {review} {t("deckDue")}
      </Badge>
    </div>
  );
};

const PlayButton = ({ deckId }: { deckId: string }) => {
  const { t } = useTranslation();
  const navigateToStudy = useNavigateToStudy();

  return (
    <Button
      type="button"
      size="icon"
      className="size-7 shrink-0"
      onClick={() => navigateToStudy(deckId)}
      aria-label={t("deckStudy")}
    >
      <Play className="size-3.5" />
    </Button>
  );
};

const DeckMenu = ({
  deckId,
  onEdit,
  onDelete,
}: {
  deckId: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shrink-0"
          aria-label={t("deckOptionsAria")}
        >
          <MoreVertical className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(deckId)}>
            <Pencil className="size-4" />
            {t("deckEdit")}
          </DropdownMenuItem>
        )}

        {onDelete && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(deckId)}
          >
            <Trash2 className="size-4" />
            {t("settingsDelete")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const DeckCard = ({ deck, onEdit, onDelete }: DeckCardProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useLocalExpanded(deck.id);
  const hasChildren = !!deck.children?.length;

  return (
    <Card className="flex flex-col gap-5 border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md md:p-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex min-h-9 items-center justify-between gap-2">
          <Text
            as="h3"
            className="min-w-0 flex-1 truncate text-base font-semibold md:text-lg"
          >
            {deck.name}
          </Text>

          <div className="flex shrink-0 items-center gap-2">
            <PlayButton deckId={deck.id} />
            <DeckMenu deckId={deck.id} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>

        <CardCounts
          newCount={deck.new}
          learning={deck.learning}
          review={deck.review}
        />
      </div>

      {hasChildren && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full justify-between gap-2 border-dashed bg-muted/20 text-left transition-colors hover:bg-muted/40 active:scale-100"
            >
              <span>
                {t("deckSubdecks")}
                <Text
                  as="span"
                  styleVariant="muted"
                  className="ml-1.5 font-normal"
                >
                  ({deck.children!.length})
                </Text>
              </span>

              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  open && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <ul className="mt-2 flex flex-col gap-2">
              {deck.children!.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-start gap-3 rounded-md border border-dashed border-border px-3 py-3"
                >
                  <div className="flex flex-1 flex-col space-y-2">
                    <Text
                      as="span"
                      className="min-w-0 flex-1 truncate text-sm font-medium"
                    >
                      {sub.name}
                    </Text>

                    <CardCounts
                      newCount={sub.new}
                      learning={sub.learning}
                      review={sub.review}
                    />
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <PlayButton deckId={sub.id} />
                    <DeckMenu
                      deckId={sub.id}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};
