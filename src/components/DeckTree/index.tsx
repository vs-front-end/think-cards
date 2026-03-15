import { useState } from "react";
import { cn } from "@stellar-ui-kit/shared";
import { useDecks } from "@/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
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

function DeckTreeItem({
  node,
  depth,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  node: DeckNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <li
      className={cn(
        depth === 0 && "pb-2 border-b border-border last:border-b-0",
        "mb-2",
      )}
    >
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors",
          isSelected
            ? "bg-primary-soft text-primary font-medium"
            : "text-foreground hover:bg-surface",
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
            !hasChildren && "invisible",
            expanded && "rotate-90",
          )}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronRight className="size-5" />
        </button>

        <span className="flex-1 truncate">{node.name}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Deck actions"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "flex size-7 items-center justify-center rounded",
                isSelected ? "text-primary" : "text-muted",
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
            <DropdownMenuItem
              onClick={() =>
                navigate({ to: "/study", search: { deckId: node.id } })
              }
            >
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
          {node.children.map((child) => (
            <DeckTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

type DeckTreeProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateDeck: () => void;
};

export function DeckTree({
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onCreateDeck,
}: DeckTreeProps) {
  const { t } = useTranslation();
  const { data: decks = [], isLoading } = useDecks();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between px-1">
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

      <Separator className="my-1" />

      <div className="themed-scroll flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-1.5 px-1">
            <Skeleton className="h-7 rounded-lg" />
            <Skeleton className="h-7 rounded-lg" />
            <Skeleton className="h-7 rounded-lg" />
          </div>
        ) : decks.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <Text as="p" className="text-xs text-muted">
              {t("deckTreeNoDecks")}
            </Text>

            <button
              type="button"
              onClick={onCreateDeck}
              className="mt-1 text-xs text-primary hover:underline"
            >
              {t("deckTreeCreateOne")}
            </button>
          </div>
        ) : (
          <ul className="pb-1">
            {decks.map((node) => (
              <DeckTreeItem
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedId}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
