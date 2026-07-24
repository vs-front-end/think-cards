import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@stellar-ui-kit/shared";
import { toast } from "sonner";
import { Copy, Check, Plus } from "lucide-react";
import { useDecksList } from "@/hooks";
import { DeckModal } from "@/components";
import type { CardType } from "@/lib/db";
import { AI_LINKS, PROMPTS } from "./prompts";
import { bulkAddCards } from "./bulk-add";
import { ImportAnki } from "./components/import-anki";

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  TextArea,
} from "@stellar-ui-kit/web";

type RawCard = { front: string; back?: string };

const MAX_AI_CARDS = 100;

const parseCards = (raw: string, type: CardType): RawCard[] | null => {
  try {
    const parsed: unknown = JSON.parse(raw.trim());
    if (!Array.isArray(parsed)) return null;

    const cards: RawCard[] = [];

    for (const item of parsed) {
      if (typeof item !== "object" || item === null) return null;
      const obj = item as Record<string, unknown>;

      if (typeof obj.front !== "string" || !obj.front.trim()) return null;

      if (type === "cloze") {
        if (!/\{\{c\d+::[^}]+\}\}/.test(obj.front)) return null;
        cards.push({ front: obj.front.trim() });
      } else {
        if (typeof obj.back !== "string" || !obj.back.trim()) return null;
        cards.push({ front: obj.front.trim(), back: obj.back.trim() });
      }
    }

    return cards.length > 0 ? cards : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const GenerateCardsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language in PROMPTS ? i18n.language : "en";
  const prompts = PROMPTS[lang];

  const navigate = useNavigate();
  const { data: decks } = useDecksList();

  const [promptTab, setPromptTab] = useState<CardType>("basic");
  const [cardType, setCardType] = useState<CardType>("basic");
  const [deckId, setDeckId] = useState("");
  const [json, setJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outerTab, setOuterTab] = useState("ai");

  const parsed = json.trim() ? parseCards(json, cardType) : null;
  const isInvalid = json.trim().length > 0 && parsed === null;
  const isOverLimit = parsed !== null && parsed.length > MAX_AI_CARDS;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompts[promptTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!deckId) {
      toast.error(t("generateCardsDeckRequired"));
      return;
    }

    if (!parsed) {
      toast.error(t("generateCardsInvalidJson"));
      return;
    }

    if (parsed.length > MAX_AI_CARDS) {
      toast.error(t("generateCardsTooManyCards", { max: MAX_AI_CARDS }));
      return;
    }

    setImporting(true);

    try {
      await bulkAddCards(
        deckId,
        parsed.map((card) => ({
          type: cardType,
          front: card.front,
          back: card.back ?? "",
        })),
      );

      toast.success(t("generateCardsSuccess", { count: parsed.length }));
      navigate({ to: "/decks", search: { deckId } });
    } catch {
      toast.error(t("generateCardsError"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-20 md:px-6 md:py-8">
      <div className="mb-6">
        <Text
          as="h1"
          className="text-2xl font-semibold tracking-tight md:text-3xl"
        >
          {t("generateCardsTitle")}
        </Text>
        <Text as="p" styleVariant="muted" className="mt-1 text-sm">
          {t("generateCardsSubtitle")}
        </Text>
      </div>

      <Tabs value={outerTab} onValueChange={setOuterTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="ai">{t("generateCardsTabAi")}</TabsTrigger>
          <TabsTrigger value="anki">{t("generateCardsTabAnki")}</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <div>
            <Text as="h2" className="text-lg font-semibold text-foreground">
              {t("generateCardsStep1Title")}
            </Text>
            <Text as="p" className="mt-1 text-sm text-muted">
              {t("generateCardsStep1Desc")}
            </Text>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {AI_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-surface px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
              >
                {label} ↗
              </a>
            ))}
          </div>

          <Text as="p" className="text-sm text-muted">
            {t("generateCardsStep1PromptNote")}
          </Text>

          <Tabs
            value={promptTab}
            onValueChange={(v) => setPromptTab(v as CardType)}
          >
            <TabsList>
              <TabsTrigger value="basic">{t("cardModalTypeBasic")}</TabsTrigger>
              <TabsTrigger value="typing">
                {t("cardModalTypeTyping")}
              </TabsTrigger>
              <TabsTrigger value="cloze">{t("cardModalTypeCloze")}</TabsTrigger>
            </TabsList>

            {(["basic", "typing", "cloze"] as CardType[]).map((type) => (
              <TabsContent key={type} value={type}>
                <div className="relative">
                  <pre className="overflow-x-auto rounded-md bg-surface p-4 text-xs text-foreground ring-1 ring-border whitespace-pre-wrap">
                    {prompts[type]}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 flex items-center gap-1 rounded px-2 py-1 text-xs text-muted bg-surface ring-1 ring-border transition-colors hover:bg-border"
                  >
                    {copied ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copied ? t("generateCardsCopied") : t("generateCardsCopy")}
                  </button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <Text as="h2" className="text-lg font-semibold text-foreground">
              {t("generateCardsStep2Title")}
            </Text>
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>{t("generateCardsDeckLabel")}</Label>
              <button
                type="button"
                onClick={() => setDeckModalOpen(true)}
                className="flex items-center bg-primary rounded-md px-2 py-1 gap-0.5 text-xs text-white"
              >
                <Plus className="size-4 pb-0.5" />
                {t("generateCardsNewDeck")}
              </button>
            </div>

            <Text as="p" className="text-xs text-muted">
              {t("generateCardsDeckDesc")}
            </Text>

            <Select
              value={deckId}
              onValueChange={setDeckId}
              disabled={decks.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    decks.length === 0
                      ? t("generateCardsDeckEmpty")
                      : t("generateCardsDeckPlaceholder")
                  }
                />
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

          <div className="flex flex-col gap-1.5">
            <Label>{t("generateCardsTypeLabel")}</Label>
            <Text as="p" className="text-xs text-muted">
              {t("generateCardsTypeDesc")}
            </Text>
            <Select
              value={cardType}
              onValueChange={(v) => {
                setCardType(v as CardType);
                setJson("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">{t("cardModalTypeBasic")}</SelectItem>
                <SelectItem value="typing">
                  {t("cardModalTypeTyping")}
                </SelectItem>
                <SelectItem value="cloze">{t("cardModalTypeCloze")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>{t("generateCardsJsonLabel")}</Label>
              {parsed && (
                <Text as="span" className="text-xs text-foreground">
                  {t("generateCardsDetected", { count: parsed.length })}
                </Text>
              )}
            </div>

            <Text as="p" className="text-xs text-muted">
              {t("generateCardsJsonDesc")}
            </Text>

            <TextArea
              placeholder={t("generateCardsJsonPlaceholder")}
              value={json}
              onChange={(e) => setJson(e.target.value)}
              className={cn(isInvalid && "ring-error")}
              style={{ minHeight: "12rem", resize: "vertical" }}
            />

            {isInvalid && (
              <Text as="p" className="text-xs text-error-text">
                {t("generateCardsInvalidJson")}
              </Text>
            )}

            {isOverLimit && (
              <Text as="p" className="text-xs text-error-text">
                {t("generateCardsTooManyCards", { max: MAX_AI_CARDS })}
              </Text>
            )}
          </div>

          <Button
            type="button"
            onClick={handleImport}
            disabled={importing || !deckId || !parsed || isOverLimit}
            className="w-full sm:w-auto"
          >
            {importing
              ? t("generateCardsImporting")
              : t("generateCardsImport", { count: parsed?.length ?? 0 })}
          </Button>
        </section>
          </div>
        </TabsContent>

        <TabsContent value="anki">
          <ImportAnki />
        </TabsContent>
      </Tabs>

      <DeckModal open={deckModalOpen} onOpenChange={setDeckModalOpen} />
    </div>
  );
};
