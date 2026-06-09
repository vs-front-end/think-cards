import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Upload, Plus, TriangleAlert } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Text,
} from "@stellar-ui-kit/web";

import { useDecksList } from "@/hooks";
import { DeckModal } from "@/components";

import type { AnkiImportErrorCode, AnkiImportResult } from "../../anki-import";
import { bulkAddCards } from "../../bulk-add";

const MAX_APKG_MB = 5;
const MAX_APKG_BYTES = MAX_APKG_MB * 1024 * 1024;

const ERROR_KEY: Record<AnkiImportErrorCode, string> = {
  "new-format": "ankiImportErrorNewFormat",
  invalid: "ankiImportErrorInvalid",
  "parse-error": "ankiImportErrorParse",
  "too-large": "ankiImportErrorTooLarge",
};

const toErrorCode = (error: unknown): AnkiImportErrorCode => {
  const code = (error as { code?: unknown } | null)?.code;
  return code === "new-format" || code === "invalid" ? code : "parse-error";
};

export const ImportAnki = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: decks } = useDecksList();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<AnkiImportResult | null>(null);
  const [errorCode, setErrorCode] = useState<AnkiImportErrorCode | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deckId, setDeckId] = useState("");
  const [deckModalOpen, setDeckModalOpen] = useState(false);

  const importable = result ? result.basic + result.cloze : 0;

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setResult(null);
    setErrorCode(null);

    if (file.size > MAX_APKG_BYTES) {
      setErrorCode("too-large");
      return;
    }

    setParsing(true);

    try {
      const { parseApkg } = await import("../../anki-import");
      setResult(await parseApkg(await file.arrayBuffer()));
    } catch (error) {
      setErrorCode(toErrorCode(error));
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!deckId) {
      toast.error(t("generateCardsDeckRequired"));
      return;
    }
    if (!result || importable === 0) return;

    setImporting(true);
    try {
      await bulkAddCards(deckId, result.cards);
      toast.success(t("generateCardsSuccess", { count: importable }));
      navigate({ to: "/decks", search: { deckId } });
    } catch {
      toast.error(t("generateCardsError"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text as="h2" className="text-lg font-semibold text-foreground">
          {t("ankiImportTitle")}
        </Text>
        <Text as="p" className="mt-1 text-sm text-muted">
          {t("ankiImportDesc")}
        </Text>
      </div>

      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>{t("ankiImportLimitsTitle")}</AlertTitle>
        <AlertDescription>{t("ankiImportLimits")}</AlertDescription>
      </Alert>

      <section className="flex flex-col gap-4">
        <div>
          <Text as="h3" className="text-sm font-semibold text-foreground">
            {t("ankiImportHowTitle")}
          </Text>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-sm text-muted">
            <li>{t("ankiImportHowStep1")}</li>
            <li>{t("ankiImportHowStep2")}</li>
          </ol>
        </div>

        <Separator />

        <input
          ref={inputRef}
          type="file"
          accept=".apkg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={parsing}
            className="shrink-0"
          >
            <Upload className="size-4" />
            {parsing ? t("ankiImportParsing") : t("ankiImportSelectFile")}
          </Button>
          {fileName && !parsing && (
            <Text
              as="span"
              className="min-w-0 max-w-full break-all text-sm text-muted"
            >
              {fileName}
            </Text>
          )}
        </div>

        {errorCode && (
          <Text as="p" className="text-sm text-error-text">
            {t(ERROR_KEY[errorCode], { max: MAX_APKG_MB })}
          </Text>
        )}

        {result && (
          <Text as="p" className="text-sm text-foreground">
            {t("ankiImportSummary", {
              basic: result.basic,
              cloze: result.cloze,
              skipped: result.skipped,
            })}
          </Text>
        )}
      </section>

      {result && importable > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <Text as="h2" className="text-lg font-semibold text-foreground">
              {t("ankiImportStep2Title")}
            </Text>
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>{t("generateCardsDeckLabel")}</Label>
              <button
                type="button"
                onClick={() => setDeckModalOpen(true)}
                className="flex items-center gap-0.5 rounded-md bg-primary px-2 py-1 text-xs text-white"
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

          <Button
            type="button"
            onClick={handleImport}
            disabled={importing || !deckId}
            className="w-full sm:w-auto"
          >
            {importing
              ? t("ankiImportImporting")
              : t("ankiImportButton", { count: importable })}
          </Button>
        </section>
      )}

      {result && importable === 0 && !errorCode && (
        <Text as="p" className="text-sm text-muted">
          {t("ankiImportNothing")}
        </Text>
      )}

      <DeckModal open={deckModalOpen} onOpenChange={setDeckModalOpen} />
    </div>
  );
};
