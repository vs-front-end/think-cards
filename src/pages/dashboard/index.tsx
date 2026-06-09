import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useSyncStore } from "@/store";
import { filterTree } from "@/utils";
import type { IDeck } from "@/lib/db";
import { DeckModal, DeleteDeckDialog } from "@/components";
import { cn } from "@stellar-ui-kit/shared";

import {
  BookOpen,
  CircleHelp,
  FileJson,
  Layers,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  useDashboardData,
  useDecksList,
  useDocumentHead,
  useSync,
} from "@/hooks";

import {
  DeckCard,
  EmptyDecks,
  InstallPrompt,
  OnboardingSurvey,
  OnboardingTour,
  OverviewCard,
  isOnboardingDone,
  isOnboardingSurveyPending,
  markOnboardingSurveyDone,
} from "./components";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  InputSearch,
  Skeleton,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stellar-ui-kit/web";

type ActiveModal =
  | { type: "createDeck" }
  | { type: "editDeck"; deckId: string }
  | { type: "deleteDeck"; deckId: string }
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

const deckNameCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const aggregateCounts = (node: DeckStatNode): void => {
  for (const child of node.children) {
    aggregateCounts(child);
    node.new += child.new;
    node.learning += child.learning;
    node.review += child.review;
  }
};

const buildDeckTree = (
  stats: Array<{
    id: string;
    name: string;
    parent_id: string | null;
    newCount: number;
    learningCount: number;
    reviewCount: number;
  }>,
): DeckStatNode[] => {
  const sortedStats = [...stats].sort((a, b) =>
    deckNameCollator.compare(a.name, b.name),
  );

  const map = new Map<string, DeckStatNode>();

  for (const s of sortedStats) {
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

  for (const root of roots) {
    aggregateCounts(root);
  }

  return roots;
};

export const DashboardPage = () => {
  const { t } = useTranslation();
  useDocumentHead({ title: t("dashboardTitle") });

  const { data, isLoading } = useDashboardData();
  const { data: flatDecks = [] } = useDecksList();

  const navigate = useNavigate();
  const { triggerSync } = useSync();
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const initialSyncDone = useSyncStore((s) => s.initialSyncDone);

  const [modal, setModal] = useState<ActiveModal>(null);
  const [deckSearch, setDeckSearch] = useState("");
  const [onboardingDismissed, setOnboardingDismissed] = useState(() =>
    isOnboardingDone(),
  );
  const [surveyOpen, setSurveyOpen] = useState(false);

  useEffect(() => {
    if (!isOnboardingSurveyPending()) return;

    const id = setTimeout(() => setSurveyOpen(true), 1000);
    return () => clearTimeout(id);
  }, []);

  const showOnboarding =
    initialSyncDone &&
    !isLoading &&
    !onboardingDismissed &&
    (data?.totalDecks ?? 0) === 0;

  const deckMap = new Map<string, IDeck>(flatDecks.map((d) => [d.id, d]));

  const editDeck =
    modal?.type === "editDeck" ? deckMap.get(modal.deckId) : undefined;

  const deleteDeck =
    modal?.type === "deleteDeck" ? deckMap.get(modal.deckId) : undefined;

  const deckTree = buildDeckTree(data?.deckStats ?? []);

  const filteredDeckTree = deckSearch
    ? filterTree(deckTree, deckSearch.toLowerCase())
    : deckTree;

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-20 pt-6 md:px-6 md:py-8">
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text
            as="h1"
            className="mb-1 text-2xl font-semibold tracking-tight md:text-3xl"
          >
            {t("dashboardTitle")}
          </Text>

          <Text as="p" styleVariant="muted" className="text-sm">
            {t("dashboardSubtitle")}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted hover:text-foreground"
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="flex-1 gap-1.5 md:hidden"
                disabled={!initialSyncDone}
              >
                <Plus className="size-4 shrink-0" />
                <span className="truncate">{t("dashboardCreateAction")}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem
                onClick={() => setModal({ type: "createDeck" })}
                className="items-start focus:bg-transparent"
              >
                <Layers className="size-4 shrink-0 translate-y-px" />
                <div className="flex flex-col gap-0.5">
                  {t("dashboardNewDeck")}
                  <span className="text-xs text-muted">
                    {t("navAddDeckHint")}
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  navigate({ to: "/cards/new", search: { deckId: undefined } })
                }
                className="items-start focus:bg-transparent"
              >
                <BookOpen className="size-4 shrink-0 translate-y-px" />
                <div className="flex flex-col gap-0.5">
                  {t("dashboardNewCard")}
                  <span className="text-xs text-muted">
                    {t("navAddCardHint")}
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate({ to: "/generate-cards" })}
                className="items-start focus:bg-transparent"
              >
                <FileJson className="size-4 shrink-0 translate-y-px" />
                <div className="flex flex-col gap-0.5">
                  {t("navImportCards")}
                  <span className="text-xs text-muted">
                    {t("navImportCardsHint")}
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            size="sm"
            onClick={() => setModal({ type: "createDeck" })}
            className="hidden gap-1.5 md:flex"
            disabled={!initialSyncDone}
          >
            <Plus className="size-4" />
            {t("dashboardNewDeck")}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!initialSyncDone}
            onClick={() =>
              navigate({ to: "/cards/new", search: { deckId: undefined } })
            }
            className="hidden gap-1.5 md:flex"
          >
            <Plus className="size-4" />
            {t("dashboardNewCard")}
          </Button>
        </div>
      </div>

      <InstallPrompt visible={!showOnboarding} />

      <section>
        <OverviewCard data={data} isLoading={isLoading} />
      </section>

      <section className="mt-2 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 max-[425px]:flex-col max-[425px]:items-stretch max-[425px]:gap-3">
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
                    onClick={() => navigate({ to: "/how-it-works" })}
                  >
                    <CircleHelp className="size-4" />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p>{t("navHowItWorks")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-full flex-1 rounded-lg min-[426px]:max-w-xs" />
          ) : !isLoading && deckTree.length > 0 ? (
            <InputSearch
              placeholder={t("dashboardSearchDecks")}
              value={deckSearch}
              onChange={setDeckSearch}
              className="w-full flex-1 min-[426px]:max-w-xs"
            />
          ) : null}
        </div>

        {(isLoading || !initialSyncDone) && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        )}

        {!isLoading && initialSyncDone && deckTree.length === 0 ? (
          <EmptyDecks onCreateDeck={() => setModal({ type: "createDeck" })} />
        ) : !isLoading && initialSyncDone ? (
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
        ) : null}
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

      {showOnboarding && (
        <OnboardingTour onDone={() => setOnboardingDismissed(true)} />
      )}

      <OnboardingSurvey
        open={surveyOpen}
        onOpenChange={(open) => {
          setSurveyOpen(open);
          if (!open) markOnboardingSurveyDone();
        }}
      />
    </div>
  );
};
