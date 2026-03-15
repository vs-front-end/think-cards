import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@stellar-ui-kit/shared";
import { useCreateCard, useDecksList, useUpdateCard } from "@/hooks";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import type { ICard, CardType } from "@/lib/db";
import { nextClozeIndex, parseClozePreview } from "@/utils/cloze";

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextArea,
  TextEditor,
} from "@stellar-ui-kit/web";
import type { TextEditorRef } from "@stellar-ui-kit/web";

type ICardFormProps = {
  card?: ICard;
  defaultDeckId?: string;
};

export function CardForm({ card, defaultDeckId }: ICardFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: decks = [] } = useDecksList();

  const createCard = useCreateCard();
  const updateCard = useUpdateCard();

  const isEdit = !!card;

  const [deckId, setDeckId] = useState(card?.deck_id ?? defaultDeckId ?? "");
  const [type, setType] = useState<CardType>(card?.type ?? "basic");
  const [front, setFront] = useState(card?.front ?? "");
  const [back, setBack] = useState(card?.back ?? "");
  const [cloze, setCloze] = useState(card?.type === "cloze" ? card.front : "");
  const [errors, setErrors] = useState({ deck: "", content: "" });

  const frontEditorRef = useRef<TextEditorRef>(null);
  const backEditorRef = useRef<TextEditorRef>(null);
  const clozeRef = useRef<HTMLTextAreaElement>(null);

  const handleCancel = () => {
    navigate({ to: "/decks" });
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

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error("Not authenticated");

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("card-images")
      .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage.from("card-images").getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const validate = (): boolean => {
    const next = { deck: "", content: "" };

    if (!deckId) next.deck = t("cardModalErrorDeck");

    if (type === "basic" || type === "typing") {
      const frontText =
        frontEditorRef.current?.getText().trim() ?? front.trim();
      const backText = backEditorRef.current?.getText().trim() ?? back.trim();

      if (!frontText || !backText) {
        next.content = t("cardModalErrorFrontBack");
      }
    } else {
      if (!cloze.trim()) next.content = t("cardModalErrorClozeEmpty");
      else if (!/\{\{c\d+::[^}]+\}\}/.test(cloze)) {
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

    const frontValue =
      type !== "cloze"
        ? (frontEditorRef.current?.getHTML() ?? front).trim()
        : "";

    const backValue =
      type !== "cloze" ? (backEditorRef.current?.getHTML() ?? back).trim() : "";

    if (isEdit && card) {
      updateCard.mutate(
        {
          id: card.id,
          deck_id: deckId,
          type,
          front: type === "cloze" ? cloze.trim() : frontValue,
          back: type === "cloze" ? "" : backValue,
        },
        { onSuccess: handleCancel },
      );
    } else {
      const payload =
        type === "cloze"
          ? { deck_id: deckId, type, front: cloze.trim(), back: "" }
          : { deck_id: deckId, type, front: frontValue, back: backValue };

      createCard.mutate(payload, {
        onSuccess: () => {
          setFront("");
          setBack("");
          setCloze("");
          frontEditorRef.current?.clear();
          backEditorRef.current?.clear();
          setErrors({ deck: "", content: "" });
        },
      });
    }
  };

  const isPending = createCard.isPending || updateCard.isPending;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-20 md:px-6 md:py-8">
      <div>
        <Text as="h1" className="text-2xl font-semibold tracking-tight">
          {isEdit ? t("cardModalEditTitle") : t("cardModalCreateTitle")}
        </Text>
      </div>

      <div className="flex flex-col gap-6">
        <div className={cn("flex flex-col gap-3", !isEdit && "sm:flex-row")}>
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

            {errors.deck && (
              <Text as="p" className="text-xs text-error-text">
                {errors.deck}
              </Text>
            )}
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

              <TextEditor
                ref={frontEditorRef}
                value={front}
                onChange={setFront}
                placeholder={
                  type === "typing"
                    ? t("cardModalQuestionPlaceholder")
                    : t("cardModalFrontPlaceholder")
                }
                onUploadImage={uploadImage}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("cardModalBackLabel")}</Label>

              <TextEditor
                ref={backEditorRef}
                value={back}
                onChange={setBack}
                placeholder={
                  type === "typing"
                    ? t("cardModalAnswerPlaceholder")
                    : t("cardModalBackPlaceholder")
                }
                onUploadImage={uploadImage}
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
              onChange={(e) => setCloze(e.target.value)}
              placeholder={t("cardModalClozePlaceholder")}
              className="w-full font-mono text-sm"
              style={{ minHeight: "10rem", resize: "vertical" }}
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

        <div className="flex flex-1 items-center justify-end gap-4">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            {t("cardModalCancel")}
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-28"
          >
            {isEdit ? t("cardModalSave") : t("cardModalCreate")}
          </Button>
        </div>
      </div>
    </div>
  );
}
