import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useNavigateToStudy } from "@/hooks";
import { BookOpen, Layers, Play, Plus } from "lucide-react";
import type { CardStatus, CardWithState } from "@/hooks/useCardsWithState";
import { CARDS_PAGE_SIZE } from "@/hooks/useCardsWithState";
import { db } from "@/lib/db";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputSearch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
  Text,
} from "@stellar-ui-kit/web";

import {
  useBulkDeleteCards,
  useCardsWithState,
  useDecksList,
  useMoveCards,
} from "@/hooks";

import { CardRow } from "../card-row";
import { EmptyCards } from "../empty-cards";

type CardTypeFilter = "all" | "basic" | "cloze" | "typing";
type StatusFilter = "all" | CardStatus;

type VirtualizedCardListProps = {
  cards: CardWithState[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  scrollRootRef: RefObject<HTMLDivElement | null>;
};

type CardPanelProps = {
  deckId: string | null;
  deckName: string;
  onCreateDeck: () => void;
  onCreateCard: () => void;
  onEditCard: (id: string) => void;
  onDeleteCard: (id: string) => void;
};

const VirtualizedCardList = ({
  cards,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onLoadMore,
  hasMore,
  scrollRootRef,
}: VirtualizedCardListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRootRef.current;

    if (!sentinel || !hasMore || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { root, rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, scrollRootRef]);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {cards.map((card) => (
        <CardRow
          key={card.id}
          card={card}
          selected={selected.has(card.id)}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-4"
        >
          <Spinner className="size-4 text-muted" />
        </div>
      )}
    </div>
  );
};

export const CardPanel = ({
  deckId,
  deckName,
  onCreateDeck,
  onCreateCard,
  onEditCard,
  onDeleteCard,
}: CardPanelProps) => {
  const { t } = useTranslation();
  const navigateToStudy = useNavigateToStudy();

  const moveCards = useMoveCards();
  const bulkDelete = useBulkDeleteCards();
  const { data: allDecks = [], isLoading: decksLoading } = useDecksList();

  const [limit, setLimit] = useState(CARDS_PAGE_SIZE);
  const {
    data: cards = [],
    isLoading,
    hasMore,
    total,
  } = useCardsWithState(deckId, limit);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CardTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [movingTo, setMovingTo] = useState("");
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [confirmBulkMoveOpen, setConfirmBulkMoveOpen] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const handleLoadMore = useCallback(() => {
    setLimit((prev) => prev + CARDS_PAGE_SIZE);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = async () => {
    if (allSelected) {
      setSelected(new Set());
      return;
    }

    if (!hasActiveFilters && hasMore && deckId) {
      const allIds = await db.cards
        .where("deck_id")
        .equals(deckId)
        .filter((c) => c.deleted_at === null)
        .primaryKeys();
      setSelected(new Set(allIds as string[]));
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;

    bulkDelete.mutate([...selected], {
      onSuccess: () => setSelected(new Set()),
    });
  };

  const handleBulkMove = () => {
    if (!movingTo || selected.size === 0) return;

    moveCards.mutate(
      { cardIds: [...selected], targetDeckId: movingTo },
      {
        onSuccess: () => {
          setSelected(new Set());
          setMovingTo("");
        },
      },
    );
  };

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;

      if (deferredSearch) {
        const term = deferredSearch.toLowerCase();

        return (
          c.front.toLowerCase().includes(term) ||
          c.back.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [cards, typeFilter, statusFilter, deferredSearch]);

  const hasActiveFilters =
    typeFilter !== "all" || statusFilter !== "all" || deferredSearch !== "";
  const displayCount = hasActiveFilters ? filtered.length : total;

  const allSelected = hasActiveFilters
    ? filtered.length > 0 && filtered.every((c) => selected.has(c.id))
    : total > 0 && selected.size >= total;

  const scrollRootRef = useRef<HTMLDivElement>(null);
  const showCardChrome = !isLoading && filtered.length > 0;

  useEffect(() => {
    setLimit(CARDS_PAGE_SIZE);
    setSelected(new Set());
  }, [deckId]);

  if (!deckId) {
    if (decksLoading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <Skeleton className="size-12 shrink-0 rounded-lg" />

          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <Skeleton className="h-9 w-40" />
        </div>
      );
    }

    if (allDecks.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Layers className="size-12 shrink-0 text-muted" />

          <div className="flex max-w-md flex-col gap-2">
            <Text as="h2" className="text-lg font-semibold text-foreground">
              {t("cardPanelNoDecksTitle")}
            </Text>

            <Text as="p" className="text-sm text-muted">
              {t("cardPanelNoDecksDescription")}
            </Text>
          </div>

          <Button
            type="button"
            className="gap-1.5 h-8 font-normal"
            onClick={onCreateDeck}
          >
            <Plus className="size-4" />
            {t("cardPanelCreateFirstDeck")}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <BookOpen className="size-10 text-muted" />
        <Text as="p" className="text-muted">
          {t("deckSelectHint")}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div
        ref={scrollRootRef}
        className="themed-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="sticky top-0 z-10 bg-background px-4 pb-3 pt-3 md:pt-8">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <Text as="h2" className="truncate font-semibold text-lg">
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

            <div className="flex shrink-0 items-center gap-2 flex-1 md:flex-none">
              <Button
                type="button"
                size="sm"
                className="gap-1.5 flex-1 font-normal"
                onClick={onCreateCard}
              >
                <Plus className="size-3.5" />
                {t("cardPanelNewCard")}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1 font-normal"
                onClick={() => navigateToStudy(deckId!)}
              >
                <Play className="size-3.5" />
                {t("cardPanelStudy")}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
            <div className="min-w-[7.5rem] flex-1">
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as CardTypeFilter)}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">{t("cardPanelAllTypes")}</SelectItem>
                  <SelectItem value="basic">
                    {t("cardPanelTypeBasic")}
                  </SelectItem>

                  <SelectItem value="cloze">
                    {t("cardPanelTypeCloze")}
                  </SelectItem>

                  <SelectItem value="typing">
                    {t("cardPanelTypeTyping")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[7.5rem] flex-1">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    {t("cardPanelAllStatuses")}
                  </SelectItem>

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
                onChange={setSearch}
                placeholder={t("dashboardSearchDecks")}
              />
            </div>
          </div>

          {showCardChrome && selected.size > 0 && (
            <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <Select value={movingTo} onValueChange={setMovingTo}>
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
                    className="h-8 font-normal flex-1"
                    onClick={() => setConfirmBulkMoveOpen(true)}
                    disabled={moveCards.isPending}
                  >
                    {t("cardPanelMove")}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 font-normal flex-1"
                  onClick={() => setSelected(new Set())}
                >
                  {t("cardPanelClear")}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 font-normal flex-1"
                  onClick={() => setConfirmBulkDeleteOpen(true)}
                  disabled={bulkDelete.isPending}
                >
                  {t("cardPanelDelete")}
                </Button>
              </div>
            </div>
          )}

          {showCardChrome && (
            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2 my-0.5">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="shrink-0"
                />

                <Text as="span" className="text-xs text-muted pt-0.5">
                  {t("cardPanelSelectAll")}
                </Text>
              </label>

              {selected.size > 0 && (
                <Text as="span" className="text-xs font-medium">
                  {t("cardPanelSelected", { count: selected.size })}
                </Text>
              )}
            </div>
          )}

          <div className="mt-3 h-px w-full bg-border" aria-hidden />
        </div>

        <div className="px-4 pb-20 pt-3 md:pb-4">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-lg bg-surface px-3 py-3 md:px-4"
                >
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[min(50vh,24rem)] flex-col items-center justify-center py-10">
              <EmptyCards onCreateCard={onCreateCard} hasSearch={!!search} />
            </div>
          ) : (
            <VirtualizedCardList
              cards={filtered}
              selected={selected}
              onToggle={toggleSelect}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              scrollRootRef={scrollRootRef}
            />
          )}
        </div>
      </div>

      <Dialog
        open={confirmBulkDeleteOpen}
        onOpenChange={(open) => {
          if (!bulkDelete.isPending) {
            setConfirmBulkDeleteOpen(open);
          }
        }}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader className="text-left">
            <DialogTitle>{t("cardPanelDelete")}</DialogTitle>
          </DialogHeader>

          <Text as="p" className="text-sm text-muted">
            {t("cardPanelConfirmBulkDelete", { count: selected.size })}
          </Text>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmBulkDeleteOpen(false)}
              disabled={bulkDelete.isPending}
            >
              {t("settingsCancel")}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmBulkDeleteOpen(false);
                handleBulkDelete();
              }}
              disabled={bulkDelete.isPending}
            >
              {t("cardPanelDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmBulkMoveOpen}
        onOpenChange={(open) => {
          if (!moveCards.isPending) {
            setConfirmBulkMoveOpen(open);
          }
        }}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader className="text-left">
            <DialogTitle>{t("cardPanelMove")}</DialogTitle>
          </DialogHeader>

          <Text as="p" className="text-sm text-muted">
            {t("cardPanelConfirmBulkMove", { count: selected.size })}
          </Text>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmBulkMoveOpen(false)}
              disabled={moveCards.isPending}
            >
              {t("settingsCancel")}
            </Button>

            <Button
              type="button"
              onClick={() => {
                setConfirmBulkMoveOpen(false);
                handleBulkMove();
              }}
              disabled={moveCards.isPending}
            >
              {t("cardPanelMove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
