import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, LayoutList } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Button,
} from "@stellar-ui-kit/web";

import { DeckModal, DeleteDeckDialog } from "@/components";
import { CardPanel, DeckTree, DeleteCardDialog } from "./components";
import { useDecksList } from "@/hooks/useDecks";
import { useCards } from "@/hooks/useCards";
import type { ICard, IDeck } from "@/lib/db";

type ActiveDeckModal =
  | { type: "createDeck" }
  | { type: "editDeck"; deckId: string }
  | { type: "deleteDeck"; deckId: string }
  | null;

type ActiveCardModal =
  | { type: "createCard"; deckId: string }
  | { type: "deleteCard"; cardId: string }
  | null;

export const DecksPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: flatDecks = [] } = useDecksList();

  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDeckId && flatDecks.length > 0) {
      setSelectedDeckId(flatDecks[0].id);
    }
  }, [flatDecks, selectedDeckId]);

  const [deckModal, setDeckModal] = useState<ActiveDeckModal>(null);
  const [cardModal, setCardModal] = useState<ActiveCardModal>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { data: deckCards = [] } = useCards(selectedDeckId ?? "");

  const deckMap = new Map<string, IDeck>(flatDecks.map((d) => [d.id, d]));
  const selectedDeck = selectedDeckId ? deckMap.get(selectedDeckId) : undefined;
  const cardMap = new Map<string, ICard>(deckCards.map((c) => [c.id, c]));

  const handleSelectDeck = (id: string) => {
    setSelectedDeckId(id);
    setMobileDrawerOpen(false);
  };

  const handleEditDeck = (id: string) => setDeckModal({ type: "editDeck", deckId: id });
  const handleDeleteDeck = (id: string) => setDeckModal({ type: "deleteDeck", deckId: id });

  const editDeck = deckModal?.type === "editDeck" ? deckMap.get(deckModal.deckId) : undefined;
  const deleteDeck = deckModal?.type === "deleteDeck" ? deckMap.get(deckModal.deckId) : undefined;
  const deleteCard = cardModal?.type === "deleteCard" ? cardMap.get(cardModal.cardId) : undefined;

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden h-full w-72 shrink-0 flex-col bg-background p-3 pt-6 md:flex md:pr-0 md:ml-2 md:pt-8">
        <DeckTree
          appearance="rail"
          selectedId={selectedDeckId}
          onSelect={handleSelectDeck}
          onEdit={handleEditDeck}
          onDelete={handleDeleteDeck}
          onCreateDeck={() => setDeckModal({ type: "createDeck" })}
        />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden md:pl-1">
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 pb-2 pt-3 md:hidden">
          <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <LayoutList className="size-4" />
                  <span className="truncate text-sm">
                    {selectedDeck ? selectedDeck.name : t("deckSelectButton")}
                  </span>
                </span>

                <ChevronDown className="size-4 text-muted" />
              </Button>
            </DrawerTrigger>

            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{t("deckDrawerTitle")}</DrawerTitle>
              </DrawerHeader>

              <div className="overflow-y-auto p-4 pb-8">
                <DeckTree
                  selectedId={selectedDeckId}
                  onSelect={handleSelectDeck}
                  onEdit={handleEditDeck}
                  onDelete={handleDeleteDeck}
                  onCreateDeck={() => {
                    setMobileDrawerOpen(false);
                    setDeckModal({ type: "createDeck" });
                  }}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <CardPanel
          deckId={selectedDeckId}
          deckName={selectedDeck?.name ?? ""}
          onCreateDeck={() => setDeckModal({ type: "createDeck" })}
          onCreateCard={() =>
            selectedDeckId &&
            navigate({ to: "/cards/new", search: { deckId: selectedDeckId } })
          }
          onEditCard={(id) => navigate({ to: "/cards/$cardId/edit", params: { cardId: id } })}
          onDeleteCard={(id: string) => setCardModal({ type: "deleteCard", cardId: id })}
        />
      </div>

      <DeckModal
        deck={deckModal?.type === "editDeck" ? editDeck : undefined}
        open={
          deckModal?.type === "createDeck" ||
          (deckModal?.type === "editDeck" && !!editDeck)
        }
        onOpenChange={(open) => !open && setDeckModal(null)}
      />

      {deleteDeck && (
        <DeleteDeckDialog
          deck={deleteDeck}
          open={deckModal?.type === "deleteDeck"}
          onOpenChange={(open) => {
            if (!open) {
              if (deleteDeck.id === selectedDeckId) setSelectedDeckId(null);
              setDeckModal(null);
            }
          }}
        />
      )}

      {deleteCard && (
        <DeleteCardDialog
          card={deleteCard}
          open={cardModal?.type === "deleteCard"}
          onOpenChange={(open) => !open && setCardModal(null)}
        />
      )}
    </div>
  );
};
