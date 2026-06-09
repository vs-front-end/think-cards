import initSqlJs from "sql.js";
import { unzipSync } from "fflate";
import DOMPurify from "dompurify";

import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

export type ImportedCard = {
  type: "basic" | "cloze";
  front: string;
  back: string;
};

export type AnkiImportResult = {
  cards: ImportedCard[];
  basic: number;
  cloze: number;
  skipped: number;
};

export type AnkiImportErrorCode =
  | "new-format"
  | "invalid"
  | "parse-error"
  | "too-large";

export class AnkiImportError extends Error {
  code: AnkiImportErrorCode;
  constructor(code: AnkiImportErrorCode) {
    super(code);
    this.code = code;
    this.name = "AnkiImportError";
  }
}

const FIELD_SEPARATOR = "\u001f";
const CLOZE_RE = /\{\{c\d+::[^}]*\}\}/;

type AnkiModel = { type: number; fieldCount: number };
type RawNote = { mid: string | number; flds: string };

const isModel = (value: unknown): value is { type: number; flds: unknown[] } =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { type?: unknown }).type === "number" &&
  Array.isArray((value as { flds?: unknown }).flds);

export const parseModels = (json: string): Map<string, AnkiModel> => {
  const raw: unknown = JSON.parse(json);
  if (typeof raw !== "object" || raw === null) {
    throw new AnkiImportError("parse-error");
  }
  const models = new Map<string, AnkiModel>();
  for (const [mid, model] of Object.entries(raw)) {
    if (isModel(model)) {
      models.set(mid, { type: model.type, fieldCount: model.flds.length });
    }
  }
  return models;
};

const cleanField = (html: string): string => {
  const withoutMedia = html.replace(/\[(sound|anki):[^\]]*\]/gi, "");
  return DOMPurify.sanitize(withoutMedia, {
    FORBID_TAGS: ["img", "audio", "video", "source", "object", "iframe"],
  }).trim();
};

export const mapNotes = (
  models: Map<string, AnkiModel>,
  notes: readonly RawNote[],
): AnkiImportResult => {
  const cards: ImportedCard[] = [];
  let basic = 0;
  let cloze = 0;
  let skipped = 0;

  for (const note of notes) {
    const model = models.get(String(note.mid));
    const fields = note.flds.split(FIELD_SEPARATOR);

    if (model?.type === 1) {
      const clozeIdx = fields.findIndex((f) => CLOZE_RE.test(f));
      const front = cleanField(fields[clozeIdx >= 0 ? clozeIdx : 0] ?? "");
      if (!CLOZE_RE.test(front)) {
        skipped++;
        continue;
      }
      const back = cleanField(
        fields.find((f, i) => i !== clozeIdx && f.trim()) ?? "",
      );
      cards.push({ type: "cloze", front, back });
      cloze++;
      continue;
    }

    if (model?.type === 0 && model.fieldCount === 2) {
      const front = cleanField(fields[0] ?? "");
      if (!front) {
        skipped++;
        continue;
      }
      cards.push({ type: "basic", front, back: cleanField(fields[1] ?? "") });
      basic++;
      continue;
    }

    skipped++;
  }

  return { cards, basic, cloze, skipped };
};

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

export const parseApkg = async (
  buffer: ArrayBuffer,
): Promise<AnkiImportResult> => {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(new Uint8Array(buffer));
  } catch {
    throw new AnkiImportError("invalid");
  }

  const collection = files["collection.anki2"] ?? files["collection.anki21"];
  if (!collection) {
    if (files["collection.anki21b"]) throw new AnkiImportError("new-format");
    throw new AnkiImportError("invalid");
  }

  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
  const database = new SQL.Database(collection);

  try {
    const modelsJson = database.exec("SELECT models FROM col LIMIT 1")[0]
      ?.values[0]?.[0];
    if (typeof modelsJson !== "string") throw new AnkiImportError("parse-error");

    const rows = database.exec("SELECT mid, flds FROM notes")[0]?.values ?? [];
    const notes: RawNote[] = rows.map((row) => ({
      mid: asString(row[0]) || Number(row[0]),
      flds: asString(row[1]),
    }));

    return mapNotes(parseModels(modelsJson), notes);
  } catch (error) {
    if (error instanceof AnkiImportError) throw error;
    throw new AnkiImportError("parse-error");
  } finally {
    database.close();
  }
};
