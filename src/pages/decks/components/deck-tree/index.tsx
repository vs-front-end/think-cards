import { useState } from "react";
import { cn } from "@stellar-ui-kit/shared";
import { useDecks, useNavigateToStudy } from "@/hooks";
import { useTranslation } from "react-i18next";
import type { DeckNode } from "@/hooks/useDecks";

import {
  ChevronRight,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator,
  Skeleton,
  Text,
} from "@stellar-ui-kit/web";

const DeckTreeItem = ({
  node,
  depth,
  firstChild,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  appearance,
}: {
  node: DeckNode;
  depth: number;
  firstChild: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  appearance: "drawer" | "rail";
}) => {
  const navigateToStudy = useNavigateToStudy();

  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;
  const isRail = appearance === "rail";

  return (
    <li
      className={cn(
        depth === 0 && "border-b border-border pb-3 last:border-b-0",
        "mb-2",
        !firstChild && "pt-1",
      )}
    >
      <div
        className={cn(
          "group flex cursor-pointer items-center rounded-lg px-2 py-1 text-sm transition-colors",
          isSelected
            ? "bg-surface text-foreground font-medium"
            : "text-muted hover:bg-surface",
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(node.id)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded transition-transform",
            !hasChildren && "hidden",
            expanded && "rotate-90",
          )}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronRight className="size-5" />
        </button>

        <span className="flex-1 truncate pl-2">{node.name}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Deck actions"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "flex size-7 items-center justify-center rounded",
                isSelected && !isRail && "text-foreground",
                (!isSelected || isRail) && "text-muted",
              )}
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="min-w-[160px]"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem onClick={() => navigateToStudy(node.id)}>
              <Play className="mr-2 size-4" />
              <span>Study</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onEdit(node.id)}>
              <Pencil className="mr-2 size-4" />
              <span>Rename</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(node.id)}
              variant="destructive"
            >
              <Trash2 className="mr-2 size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && expanded && (
        <ul className="mt-2">
          {node.children.map((child, index) => (
            <DeckTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              firstChild={index === 0}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              appearance={appearance}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

type DeckTreeProps = {
  appearance?: "drawer" | "rail";
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateDeck: () => void;
};

export const DeckTree = ({
  appearance = "drawer",
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onCreateDeck,
}: DeckTreeProps) => {
  const { t } = useTranslation();
  const { data: decks = [], isLoading } = useDecks();

  return (
    <div className="flex h-full flex-col gap-1 mt-1">
      <div className="flex items-center justify-between">
        <Text as="h2" className="text-sm font-semibold text-muted">
          {t("deckTreeDecksLabel")}
        </Text>

        <Button
          type="button"
          size="icon"
          className="size-7"
          onClick={onCreateDeck}
          aria-label="New deck"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <Separator className="my-2" />

      <div className="themed-scroll flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-1.5 px-1">
            <Skeleton className="h-7 rounded-lg" />
            <Skeleton className="h-7 rounded-lg" />
            <Skeleton className="h-7 rounded-lg" />
          </div>
        ) : decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-2 py-4 text-center gap-3">
            <Text as="p" className="text-muted text-sm">
              {t("deckTreeNoDecks")}
            </Text>

            <Button
              variant="outline"
              size="sm"
              onClick={onCreateDeck}
              className="flex gap-1.5 text-xs text-muted text-xs h-7 font-normal"
            >
              <Plus className="size-3.5" />
              {t("deckTreeCreateOne")}
            </Button>
          </div>
        ) : (
          <ul className="pb-1">
            {decks.map((node, index) => (
              <DeckTreeItem
                key={node.id}
                node={node}
                depth={0}
                firstChild={index === 0}
                selectedId={selectedId}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                appearance={appearance}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
