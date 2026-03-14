import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSyncStore } from "@/store";
import { useDashboardData, useDecksList, useIsMobile, useSync } from "@/hooks";
import { formatTimePerCard } from "@/utils";
import type { IDeck } from "@/lib/db";

import {
  DeckCard,
  DeckModal,
  CardModal,
  DeleteDeckDialog,
  EmptyDecks,
  InstallPrompt,
  OnboardingTour,
  isOnboardingDone,
  AuthGuard,
} from "@/components";

import {
  Button,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  InputSearch,
  Progress,
  Skeleton,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stellar-ui-kit/web";

import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  Clock,
  Flame,
  HelpCircle,
  Layers,
  Plus,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: () => (
    <AuthGuard>
      <DashboardComponent />
    </AuthGuard>
  ),
});

type ActiveModal =
  | { type: "createDeck" }
  | { type: "editDeck"; deckId: string }
  | { type: "deleteDeck"; deckId: string }
  | { type: "createCard" }
  | null;

type DeckStatNode = {
  id: string;
  name: string;
  parent_id: string | null;
  new: number;
  learning: number;
  review: number;
  children: DeckStatNode[];
};

function buildDeckTree(
  stats: Array<{
    id: string;
    name: string;
    parent_id: string | null;
    newCount: number;
    learningCount: number;
    reviewCount: number;
  }>,
): DeckStatNode[] {
  const map = new Map<string, DeckStatNode>();

  for (const s of stats) {
    map.set(s.id, {
      id: s.id,
      name: s.name,
      parent_id: s.parent_id,
      new: s.newCount,
      learning: s.learningCount,
      review: s.reviewCount,
      children: [],
    });
  }

  const roots: DeckStatNode[] = [];

  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function DashboardComponent() {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboardData();
  const { data: flatDecks = [] } = useDecksList();

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { triggerSync } = useSync();
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const initialSyncDone = useSyncStore((s) => s.initialSyncDone);

  const [modal, setModal] = useState<ActiveModal>(null);
  const [overviewMetricsOpen, setOverviewMetricsOpen] = useState(false);
  const [deckSearch, setDeckSearch] = useState("");

  const [onboardingDismissed, setOnboardingDismissed] = useState(() =>
    isOnboardingDone(),
  );

  const showOnboarding =
    initialSyncDone && !onboardingDismissed && (data?.totalDecks ?? 0) === 0;

  const deckMap = new Map<string, IDeck>(flatDecks.map((d) => [d.id, d]));
  const editDeck =
    modal?.type === "editDeck" ? deckMap.get(modal.deckId) : undefined;
  const deleteDeck =
    modal?.type === "deleteDeck" ? deckMap.get(modal.deckId) : undefined;

  const progressPercent =
    data && data.dailyGoal > 0
      ? Math.min(100, (data.studiedToday / data.dailyGoal) * 100)
      : 0;

  const deckTree = buildDeckTree(data?.deckStats ?? []);

  const filteredDeckTree = deckSearch
    ? deckTree.filter((deck) =>
        deck.name.toLowerCase().includes(deckSearch.toLowerCase()),
      )
    : deckTree;

  const renderMetricsGrid = () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Layers className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            styleVariant="muted"
            className="truncate text-xs font-medium"
          >
            {t("dashboardTotalDecks")}
          </Text>
          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.totalDecks ?? 0}
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary-soft text-secondary">
          <BookOpen className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            styleVariant="muted"
            className="truncate text-xs font-medium"
          >
            {t("dashboardTotalCards")}
          </Text>
          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.totalCards ?? 0}
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
          <CalendarCheck className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            styleVariant="muted"
            className="truncate text-xs font-medium"
          >
            {t("dashboardPendingToday")}
          </Text>
          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.pendingToday ?? 0}
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
          <Flame className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            styleVariant="muted"
            className="truncate text-xs font-medium"
          >
            {t("dashboardStreak")}
          </Text>
          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.streak ?? 0}
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
          <BarChart3 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            styleVariant="muted"
            className="truncate text-xs font-medium"
          >
            {t("dashboardStudiedToday")}
          </Text>
          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.studiedToday ?? 0}
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
          <Clock className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            styleVariant="muted"
            className="truncate text-xs font-medium"
          >
            {t("dashboardAvgReviewTime")}
          </Text>
          <Text as="p" className="text-md font-semibold tabular-nums">
            {t(
              "dashboardTimePerCard",
              formatTimePerCard(data?.avgSecondsPerCard ?? 0),
            )}
          </Text>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-20 md:px-6 md:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <Text
            as="h1"
            className="text-2xl font-semibold tracking-tight md:text-3xl mb-1"
          >
            {t("dashboardTitle")}
          </Text>
          <Text as="p" styleVariant="muted" className="text-sm">
            {t("dashboardSubtitle")}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted hover:text-foreground"
                  disabled={isSyncing}
                  onClick={triggerSync}
                >
                  <RefreshCw
                    className={cn("size-4", isSyncing && "animate-spin")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("syncNow")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            type="button"
            size="sm"
            onClick={() => setModal({ type: "createDeck" })}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            {t("dashboardNewDeck")}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModal({ type: "createCard" })}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            {t("dashboardNewCard")}
          </Button>
        </div>
      </div>

      <InstallPrompt visible={!showOnboarding} />

      <section>
        {isLoading ? (
          <Skeleton className="h-20 rounded-xl p-6" />
        ) : (
          <Card className="border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <Text as="h2" className="text-base font-semibold">
                {t("dashboardStatsOverview")}
              </Text>

              <Button
                type="button"
                variant="outline"
                className="h-auto gap-1.5 px-2 py-1 text-xs text-muted hover:text-foreground"
                onClick={() => navigate({ to: "/statistics" })}
              >
                <BarChart3 className="size-3.5" />
                {t("dashboardViewStatistics")}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text as="span" className="text-sm text-muted">
                  {t("dashboardTodaysProgress")}
                </Text>

                <Text
                  as="span"
                  className="text-sm font-semibold tabular-nums text-foreground"
                >
                  {data?.studiedToday ?? 0}
                  <Text as="span" className="font-normal text-muted">
                    /{data?.dailyGoal ?? 0}
                  </Text>
                </Text>
              </div>

              <Progress value={progressPercent} className="h-2 w-full" />

              <Text as="span" className="text-xs text-muted">
                {progressPercent >= 100
                  ? t("dashboardGoalReached")
                  : t("dashboardGoalRemaining", {
                      count: (data?.dailyGoal ?? 0) - (data?.studiedToday ?? 0),
                    })}
              </Text>
            </div>

            {!isMobile && (
              <div className="border-t border-border pt-3">
                {renderMetricsGrid()}
              </div>
            )}

            {isMobile && (
              <Collapsible
                open={overviewMetricsOpen}
                onOpenChange={setOverviewMetricsOpen}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-none border-b border-t border-border py-3 mb-1 text-left text-sm font-medium text-muted active:scale-100 active:bg-transparent [-webkit-tap-highlight-color:transparent]"
                  >
                    <span>{t("dashboardMetricsLabel")}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 transition-transform",
                        overviewMetricsOpen && "rotate-180",
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-3">{renderMetricsGrid()}</div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </Card>
        )}
      </section>

      <section className="mt-2 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Text as="h2" className="text-lg font-semibold">
              {t("dashboardYourDecks")}
            </Text>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted hover:text-foreground"
                    onClick={() => navigate({ to: "/help" })}
                  >
                    <HelpCircle className="size-4" />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p>{t("navHelp")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {!isLoading && deckTree.length > 0 && (
            <InputSearch
              placeholder={t("dashboardSearchDecks")}
              value={deckSearch}
              onChange={setDeckSearch}
              className="max-w-xs flex-1"
            />
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        )}

        {!isLoading && deckTree.length === 0 ? (
          <EmptyDecks onCreateDeck={() => setModal({ type: "createDeck" })} />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredDeckTree.length === 0 ? (
              <Text as="p" styleVariant="muted" className="py-8 text-center">
                {t("emptyCardsSearch")}
              </Text>
            ) : (
              filteredDeckTree.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  onEdit={(id) => setModal({ type: "editDeck", deckId: id })}
                  onDelete={(id) =>
                    setModal({ type: "deleteDeck", deckId: id })
                  }
                />
              ))
            )}
          </div>
        )}
      </section>

      <DeckModal
        deck={modal?.type === "editDeck" ? editDeck : undefined}
        open={
          modal?.type === "createDeck" ||
          (modal?.type === "editDeck" && !!editDeck)
        }
        onOpenChange={(open) => !open && setModal(null)}
      />

      {deleteDeck && (
        <DeleteDeckDialog
          deck={deleteDeck}
          open={modal?.type === "deleteDeck"}
          onOpenChange={(open) => !open && setModal(null)}
        />
      )}

      <CardModal
        open={modal?.type === "createCard"}
        onOpenChange={(open) => !open && setModal(null)}
      />

      {showOnboarding && (
        <OnboardingTour onDone={() => setOnboardingDismissed(true)} />
      )}
    </div>
  );
}
