import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { useCreateCard, useDecksList, useUpdateCard } from "@/hooks";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import type { ICard, CardType } from "@/lib/db";
import { useTranslation } from "react-i18next";
import { nextClozeIndex, parseClozePreview } from "@/utils/cloze";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Text,
  TextArea,
  Spinner,
} from "@stellar-ui-kit/web";

type ActiveField = "front" | "back" | "cloze";

type ICardModalProps = {
  card?: ICard;
  defaultDeckId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CardModal({
  card,
  defaultDeckId,
  open,
  onOpenChange,
}: ICardModalProps) {
  const { t } = useTranslation();
  const { data: decks = [] } = useDecksList();

  const createCard = useCreateCard();
  const updateCard = useUpdateCard();

  const isEdit = !!card;

  const [deckId, setDeckId] = useState(card?.deck_id ?? defaultDeckId ?? "");

  const [type, setType] = useState<CardType>(card?.type ?? "basic");
  const [front, setFront] = useState(card?.front ?? "");
  const [back, setBack] = useState(card?.back ?? "");

  const [cloze, setCloze] = useState(card?.type === "cloze" ? card.front : "");
  const [activeField, setActiveField] = useState<ActiveField>("front");

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({ deck: "", content: "" });

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const clozeRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (card) {
        setDeckId(card.deck_id);
        setType(card.type);
        setFront(card.front);
        setBack(card.back);
        setCloze(card.type === "cloze" ? card.front : "");
      } else {
        setDeckId(defaultDeckId ?? "");
        setType("basic");
        setFront("");
        setBack("");
        setCloze("");
      }
      setErrors({ deck: "", content: "" });
    }
  }, [open, card, defaultDeckId]);

  const resetForm = () => {
    setFront("");
    setBack("");
    setCloze("");
    setActiveField("front");
    setErrors({ deck: "", content: "" });
  };

  const handleClose = () => {
    if (!isEdit) {
      setDeckId(defaultDeckId ?? "");
      setType("basic");
      resetForm();
    }

    onOpenChange(false);
  };

  const handleCreateSuccess = () => {
    resetForm();
  };

  const handleCreateCloze = () => {
    const textarea = clozeRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = cloze.slice(start, end);

    if (!selected) return;

    const idx = nextClozeIndex(cloze);
    const wrapped = `{{c${idx}::${selected}}}`;
    const next = cloze.slice(0, start) + wrapped + cloze.slice(end);

    setCloze(next);
  };

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file.type.startsWith("image/")) return null;

      const userId = useAuthStore.getState().user?.id;
      if (!userId) return null;

      setUploading(true);
      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
          .from("card-images")
          .upload(path, file);

        if (error) throw error;

        const { data } = supabase.storage
          .from("card-images")
          .getPublicUrl(path);

        return data.publicUrl;
      } catch {
        return null;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const insertImage = useCallback(
    async (file: File) => {
      const url = await uploadImage(file);
      if (!url) return;

      const tag = `<img src="${url}" alt="" loading="lazy" />`;

      if (type === "cloze") {
        setCloze((prev) => prev + "\n" + tag);
        return;
      }

      if (activeField === "front") {
        setFront((prev) => prev + "\n" + tag);
      } else {
        setBack((prev) => prev + "\n" + tag);
      }
    },
    [activeField, type, uploadImage],
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const file = Array.from(e.clipboardData.items)
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();

      if (file) {
        e.preventDefault();
        await insertImage(file);
      }
    },
    [insertImage],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const file = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith("image/"),
      );

      if (file) await insertImage(file);
    },
    [insertImage],
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await insertImage(file);
    e.target.value = "";
  };

  const validate = (): boolean => {
    const next = { deck: "", content: "" };

    if (!deckId) next.deck = t("cardModalErrorDeck");

    if (type === "basic" || type === "typing") {
      if (!front.trim() || !back.trim()) {
        next.content = t("cardModalErrorFrontBack");
      }
    } else {
      if (!cloze.trim()) next.content = t("cardModalErrorClozeEmpty");

      if (!/\{\{c\d+::[^}]+\}\}/.test(cloze)) {
        next.content = isEdit
          ? t("cardModalErrorClozeDeletion")
          : t("cardModalErrorClozeDeletionCreate");
      }
    }

    setErrors(next);
    return !next.deck && !next.content;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload =
      type === "cloze"
        ? { deck_id: deckId, type, front: cloze.trim(), back: "" }
        : { deck_id: deckId, type, front: front.trim(), back: back.trim() };

    if (isEdit && card) {
      updateCard.mutate(
        {
          id: card.id,
          deck_id: deckId,
          type,
          front: type === "cloze" ? cloze.trim() : front.trim(),
          back: type === "cloze" ? "" : back.trim(),
        },
        { onSuccess: handleClose },
      );
    } else {
      createCard.mutate(payload, { onSuccess: handleCreateSuccess });
    }
  };

  const isPending = createCard.isPending || updateCard.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90dvh] w-full max-w-[calc(100%-2rem)] flex flex-col overflow-hidden sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("cardModalEditTitle") : t("cardModalCreateTitle")}
          </DialogTitle>
        </DialogHeader>

        <div
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-0.5"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onPaste={handlePaste}
        >
          {errors.deck && (
            <Text as="p" className="text-xs text-error-text">
              {errors.deck}
            </Text>
          )}

          <div
            className={
              isEdit
                ? "flex flex-col gap-1.5"
                : "flex flex-col gap-3 sm:flex-row"
            }
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>{t("cardModalDeckLabel")}</Label>

              <Select
                value={deckId}
                onValueChange={(v) => {
                  setDeckId(v);
                  setErrors((p) => ({ ...p, deck: "" }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("cardModalDeckPlaceholder")} />
                </SelectTrigger>

                <SelectContent>
                  {decks.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isEdit && (
              <div className="flex flex-col gap-1.5">
                <Label>{t("cardModalTypeLabel")}</Label>

                <Select
                  value={type}
                  onValueChange={(v) => setType(v as CardType)}
                >
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="basic">
                      {t("cardModalTypeBasic")}
                    </SelectItem>

                    <SelectItem value="cloze">
                      {t("cardModalTypeCloze")}
                    </SelectItem>

                    <SelectItem value="typing">
                      {t("cardModalTypeTyping")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {errors.content && (
            <Text as="p" className="text-xs text-error-text">
              {errors.content}
            </Text>
          )}

          {type === "basic" || type === "typing" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>{t("cardModalFrontLabel")}</Label>

                <TextArea
                  ref={frontRef}
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  onFocus={() => setActiveField("front")}
                  placeholder={
                    type === "typing"
                      ? t("cardModalQuestionPlaceholder")
                      : t("cardModalFrontPlaceholder")
                  }
                  rows={3}
                  className="w-full resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{t("cardModalBackLabel")}</Label>

                <TextArea
                  ref={backRef}
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  onFocus={() => setActiveField("back")}
                  placeholder={
                    type === "typing"
                      ? t("cardModalAnswerPlaceholder")
                      : t("cardModalBackPlaceholder")
                  }
                  rows={3}
                  className="w-full resize-none"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>{t("cardModalTextLabel")}</Label>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateCloze}
                  className="h-7 px-2 text-xs"
                >
                  {t("cardModalCreateGap")}
                </Button>
              </div>

              <TextArea
                ref={clozeRef}
                value={cloze}
                onChange={(e) => {
                  setCloze(e.target.value);
                  setActiveField("cloze");
                }}
                onFocus={() => setActiveField("cloze")}
                placeholder={t("cardModalClozePlaceholder")}
                rows={4}
                className="w-full resize-none font-mono text-sm"
              />

              {cloze && (
                <div className="rounded-md border border-border bg-surface px-3 py-2">
                  <Text as="p" className="mb-1 text-xs font-medium text-muted">
                    {t("cardModalPreview")}
                  </Text>

                  <Text as="p" className="text-sm">
                    {parseClozePreview(cloze)}
                  </Text>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 gap-1.5 text-xs text-muted w-full"
            >
              {uploading ? (
                <Spinner className="size-3.5" />
              ) : (
                <ImageIcon className="size-3.5" />
              )}

              {t("cardModalAddImage")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={handleClose}>
            {t("cardModalCancel")}
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || uploading}
          >
            {isEdit ? t("cardModalSave") : t("cardModalCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
