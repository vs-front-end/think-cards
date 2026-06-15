import { useEffect, useState } from "react";
import {
  useCreateDeck,
  useDecksList,
  useTtsEnabled,
  useUpdateDeck,
} from "@/hooks";
import type { IDeck } from "@/lib/db";
import { useTranslation } from "react-i18next";

const SPEECH_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
  { value: "ja", label: "日本語" },
  { value: "fr", label: "Français" },
  { value: "pt-BR", label: "Português (BR)" },
];

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  InputText,
  InputCounter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Text,
} from "@stellar-ui-kit/web";

type IDeckModalProps = {
  deck?: IDeck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeckModal({ deck, open, onOpenChange }: IDeckModalProps) {
  const { t } = useTranslation();
  const { data: decks = [] } = useDecksList();
  const ttsEnabled = useTtsEnabled();

  const createDeck = useCreateDeck();
  const updateDeck = useUpdateDeck();

  const isEdit = !!deck;

  const [name, setName] = useState(deck?.name ?? "");

  const [parentId, setParentId] = useState<string | null>(
    deck?.parent_id ?? null,
  );

  const [dailyGoal, setDailyGoal] = useState(deck?.daily_goal ?? 20);
  const [language, setLanguage] = useState<string | null>(
    deck?.language ?? null,
  );
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (open) {
      setName(deck?.name ?? "");
      setParentId(deck?.parent_id ?? null);
      setDailyGoal(deck?.daily_goal ?? 20);
      setLanguage(deck?.language ?? null);
      setNameError("");
    }
  }, [open, deck]);

  const handleClose = () => {
    if (!isEdit) {
      setName("");
      setParentId(null);
      setDailyGoal(20);
      setLanguage(null);
      setNameError("");
    }
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError(t("deckModalNameRequired"));
      return;
    }

    if (isEdit && deck) {
      updateDeck.mutate(
        {
          id: deck.id,
          name: name.trim(),
          parent_id: parentId,
          daily_goal: dailyGoal,
          language,
        },
        { onSuccess: handleClose },
      );
    } else {
      createDeck.mutate(
        {
          name: name.trim(),
          parent_id: parentId,
          daily_goal: dailyGoal,
          language,
        },
        { onSuccess: handleClose },
      );
    }
  };

  const availableParents =
    isEdit && deck
      ? decks.filter((d) => d.parent_id === null && d.id !== deck.id)
      : decks.filter((d) => d.parent_id === null);

  const isPending = createDeck.isPending || updateDeck.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90dvh] w-full max-w-[calc(100%-2rem)] flex flex-col overflow-hidden sm:max-w-md"
      >
        <DialogHeader className="text-left">
          <DialogTitle>
            {isEdit ? t("deckModalEditTitle") : t("deckModalCreateTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-0.5">
          <InputText
            label={t("deckModalNameLabel")}
            placeholder={t("deckModalNamePlaceholder")}
            value={name}
            onChange={(v) => {
              setName(v);
              setNameError("");
            }}
            error={nameError || undefined}
            containerClassName="w-full max-w-full"
          />

          <div className="flex flex-col gap-1.5">
            <Label>{t("deckModalParentLabel")}</Label>
            <Select
              value={parentId ?? "none"}
              onValueChange={(v) => setParentId(v === "none" ? null : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("deckModalParentNone")} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">{t("deckModalParentNone")}</SelectItem>

                {availableParents.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("deckModalDailyGoalLabel")}</Label>

            <InputCounter
              value={dailyGoal}
              onChange={setDailyGoal}
              min={1}
              max={500}
              containerClassName="w-full max-w-full"
            />

            <Text as="p" className="text-xs text-muted">
              {t("deckModalDailyGoalDesc")}
            </Text>
          </div>

          {ttsEnabled && (
            <div className="flex flex-col gap-1.5">
              <Label>Idioma (leitura)</Label>
              <Select
                value={language ?? "none"}
                onValueChange={(v) => setLanguage(v === "none" ? null : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>

                  {SPEECH_LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={handleClose}>
            {t("deckModalCancel")}
          </Button>

          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isEdit ? t("deckModalSave") : t("deckModalCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
