import { filterKeys } from "./util/validationUtil"

export interface ImportedCard {
  front: string
  back: string
}

export interface ImportedDeck {
  metadata: {
    name?: string
  }
  cards: ImportedCard[]
}

export interface ImportedFile {
  decks: ImportedDeck[]
}

export type ExportFormat = "srrjson"|"anki"|"mnemosine"
export interface ExportOptions {
  format: ExportFormat
}

export const defaultExportOptions: ExportOptions = {
  format: "srrjson",
};

export function validateExportOptions(options: Partial<ExportOptions>): Partial<ExportOptions> {
  const result = filterKeys(options, defaultExportOptions);
  return result;
}
