import { filterKeys } from "./util/validationUtil"

interface ImportedCard {
  front: string
  back: string
}

interface ImportedDeck {
  metadata: {
    name?: string
  }
  cards: ImportedCard[]
}

export interface ImportedFile {
  decks: ImportedDeck[]
}

type ExportFormat = "srrjson"|"anki"|"mnemosine"
export interface ExportOptions {
  format: ExportFormat
}

const defaultExportOptions: ExportOptions = {
  format: "srrjson",
};

// TODO hook this up
function _validateExportOptions(options: Partial<ExportOptions>): Partial<ExportOptions> {
  const result = filterKeys(options, defaultExportOptions);
  return result;
}
