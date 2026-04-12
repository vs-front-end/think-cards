import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useNavigateToStudy } from "@/hooks";
import { BookOpen, Layers, Plus } from "lucide-react";
import type { CardStatus, CardWithState } from "@/hooks/useCardsWithState";
import { CARDS_PAGE_SIZE } from "@/hooks/useCardsWithState";
import { db } from "@/lib/db";
import { Button, Skeleton, Spinner, Text } from "@stellar-ui-kit/web";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useBulkDeleteCards,
  useCardsWithState,
  useDecksList,
  useMoveCards,
} from "@/hooks";

import { CardRow } from "../card-row";
import { EmptyCards } from "../empty-cards";
import { CardPanelToolbar } from "./card-panel-toolbar";
import { ConfirmDialogs } from "./confirm-dialogs";
import { FilterDrawer } from "./filter-drawer";

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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

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

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (deferredSearch !== "" ? 1 : 0);

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
        <div className="sticky top-0 z-10 bg-background px-4 pb-2 pt-2 md:pb-3 md:pt-8">
          <CardPanelToolbar
            deckId={deckId}
            deckName={deckName}
            displayCount={displayCount}
            showCardChrome={showCardChrome}
            allSelected={allSelected}
            selectedCount={selected.size}
            activeFilterCount={activeFilterCount}
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            search={search}
            movingTo={movingTo}
            allDecks={allDecks}
            moveIsPending={moveCards.isPending}
            bulkDeleteIsPending={bulkDelete.isPending}
            onCreateCard={onCreateCard}
            onStudy={() => navigateToStudy(deckId)}
            onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
            onTypeFilterChange={setTypeFilter}
            onStatusFilterChange={setStatusFilter}
            onSearchChange={setSearch}
            onMovingToChange={setMovingTo}
            onToggleAll={toggleAll}
            onClearSelection={() => setSelected(new Set())}
            onConfirmBulkMove={() => setConfirmBulkMoveOpen(true)}
            onConfirmBulkDelete={() => setConfirmBulkDeleteOpen(true)}
          />
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

      <ConfirmDialogs
        bulkDeleteOpen={confirmBulkDeleteOpen}
        bulkMoveOpen={confirmBulkMoveOpen}
        selectedCount={selected.size}
        bulkDeleteIsPending={bulkDelete.isPending}
        moveIsPending={moveCards.isPending}
        onBulkDeleteOpenChange={setConfirmBulkDeleteOpen}
        onBulkMoveOpenChange={setConfirmBulkMoveOpen}
        onConfirmDelete={() => {
          setConfirmBulkDeleteOpen(false);
          handleBulkDelete();
        }}
        onConfirmMove={() => {
          setConfirmBulkMoveOpen(false);
          handleBulkMove();
        }}
      />

      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        search={search}
        hasActiveFilters={hasActiveFilters}
        onTypeFilterChange={setTypeFilter}
        onStatusFilterChange={setStatusFilter}
        onSearchChange={setSearch}
        onClearFilters={() => {
          setTypeFilter("all");
          setStatusFilter("all");
          setSearch("");
        }}
      />
    </div>
  );
};
