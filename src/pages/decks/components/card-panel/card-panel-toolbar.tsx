import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Play, Plus, SlidersHorizontal } from "lucide-react";
import type { CardStatus } from "@/hooks/useCardsWithState";
import type { IDeck } from "@/lib/db";

import {
  Badge,
  Button,
  Checkbox,
  InputSearch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from "@stellar-ui-kit/web";

type CardTypeFilter = "all" | "basic" | "cloze" | "typing";
type StatusFilter = "all" | CardStatus;

type CardPanelToolbarProps = {
  deckId: string;
  deckName: string;
  displayCount: number;
  showCardChrome: boolean;
  allSelected: boolean;
  selectedCount: number;
  activeFilterCount: number;
  typeFilter: CardTypeFilter;
  statusFilter: StatusFilter;
  search: string;
  movingTo: string;
  allDecks: IDeck[];
  moveIsPending: boolean;
  bulkDeleteIsPending: boolean;
  onCreateCard: () => void;
  onStudy: () => void;
  onOpenFilterDrawer: () => void;
  onTypeFilterChange: (v: CardTypeFilter) => void;
  onStatusFilterChange: (v: StatusFilter) => void;
  onSearchChange: (v: string) => void;
  onMovingToChange: (v: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onConfirmBulkMove: () => void;
  onConfirmBulkDelete: () => void;
};

export const CardPanelToolbar = ({
  deckId,
  deckName,
  displayCount,
  showCardChrome,
  allSelected,
  selectedCount,
  activeFilterCount,
  typeFilter,
  statusFilter,
  search,
  movingTo,
  allDecks,
  moveIsPending,
  bulkDeleteIsPending,
  onCreateCard,
  onStudy,
  onOpenFilterDrawer,
  onTypeFilterChange,
  onStatusFilterChange,
  onSearchChange,
  onMovingToChange,
  onToggleAll,
  onClearSelection,
  onConfirmBulkMove,
  onConfirmBulkDelete,
}: CardPanelToolbarProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border pb-2 md:flex-wrap md:gap-x-3 md:gap-y-2 md:pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Text as="h2" className="truncate text-lg font-semibold">
            {deckName}
          </Text>

          <Text as="span" className="shrink-0 text-muted">
            (
            {t(
              displayCount === 1
                ? "cardPanelCardCount_one"
                : "cardPanelCardCount_other",
              { count: displayCount },
            )}
            )
          </Text>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="hidden gap-1.5 flex-1 font-normal md:inline-flex"
            onClick={onCreateCard}
          >
            <Plus className="size-3.5" />
            {t("cardPanelNewCard")}
          </Button>

          <Button
            type="button"
            size="icon"
            className="size-8 md:hidden"
            onClick={onCreateCard}
            aria-label={t("cardPanelNewCard")}
          >
            <Plus className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden gap-1.5 flex-1 font-normal md:inline-flex"
            onClick={onStudy}
          >
            <Play className="size-3.5" />
            {t("cardPanelStudy")}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 md:hidden"
            onClick={onStudy}
            aria-label={t("cardPanelStudy")}
          >
            <Play className="size-4" />
          </Button>

          <button
            type="button"
            onClick={onOpenFilterDrawer}
            className="relative flex size-8 items-center justify-center rounded-md text-muted ring-1 ring-border transition-colors hover:bg-surface hover:text-foreground md:hidden"
            aria-label={t("cardPanelFilters")}
          >
            <SlidersHorizontal className="size-4" />

            {activeFilterCount > 0 && (
              <Badge
                variant="default"
                className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center p-0 text-[10px]"
              >
                {activeFilterCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      <div className="mt-2 hidden min-w-0 flex-wrap items-center gap-2 md:mt-3 md:flex">
        <div className="min-w-[7.5rem] flex-1">
          <Select
            value={typeFilter}
            onValueChange={(v) => onTypeFilterChange(v as CardTypeFilter)}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">{t("cardPanelAllTypes")}</SelectItem>
              <SelectItem value="basic">{t("cardPanelTypeBasic")}</SelectItem>
              <SelectItem value="cloze">{t("cardPanelTypeCloze")}</SelectItem>
              <SelectItem value="typing">{t("cardPanelTypeTyping")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[7.5rem] flex-1">
          <Select
            value={statusFilter}
            onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">{t("cardPanelAllStatuses")}</SelectItem>
              <SelectItem value="new">{t("cardPanelStatusNew")}</SelectItem>
              <SelectItem value="learning">
                {t("cardPanelStatusLearning")}
              </SelectItem>
              <SelectItem value="review">
                {t("cardPanelStatusReview")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[7.5rem] flex-1">
          <InputSearch
            value={search}
            onChange={onSearchChange}
            placeholder={t("dashboardSearchDecks")}
          />
        </div>
      </div>

      {showCardChrome && selectedCount > 0 && (
        <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:mt-3">
          <div className="min-w-0 flex-1">
            <Select value={movingTo} onValueChange={onMovingToChange}>
              <SelectTrigger size="sm" className="h-8 w-full text-xs">
                <SelectValue placeholder={t("cardPanelMoveTo")} />
              </SelectTrigger>

              <SelectContent>
                {allDecks
                  .filter((d) => d.id !== deckId)
                  .map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {movingTo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 flex-1 font-normal"
                onClick={onConfirmBulkMove}
                disabled={moveIsPending}
              >
                {t("cardPanelMove")}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 flex-1 font-normal"
              onClick={onClearSelection}
            >
              {t("cardPanelClear")}
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 flex-1 font-normal"
              onClick={onConfirmBulkDelete}
              disabled={bulkDeleteIsPending}
            >
              {t("cardPanelDelete")}
            </Button>
          </div>
        </div>
      )}

      {showCardChrome && (
        <div className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-2 md:mt-3">
          <label className="flex cursor-pointer items-center gap-2 my-0.5">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onToggleAll}
              className="shrink-0"
            />

            <Text as="span" className="text-xs text-muted pt-0.5">
              {t("cardPanelSelectAll")}
            </Text>
          </label>

          {selectedCount > 0 && (
            <Text as="span" className="text-xs font-medium">
              {t("cardPanelSelected", { count: selectedCount })}
            </Text>
          )}
        </div>
      )}

      <div
        className={cn(
          "mt-2 h-px w-full bg-border md:mt-3",
          !showCardChrome && "hidden md:block",
        )}
        aria-hidden
      />
    </>
  );
};
