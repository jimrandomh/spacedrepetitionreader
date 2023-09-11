import { importFileAnki } from "./importAnki"
import { importFileMnemomosine } from "./importMnemosine"
import type { ImportedFile } from "../../lib/importTypes"

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function importFile(filename: string, fileContents: Uint8Array): Promise<ImportedFile> {
  if (filename.endsWith(".apkg")) {
    return await importFileAnki(filename, fileContents);
  } else if(filename.endsWith(".cards")) {
    return await importFileMnemomosine(filename, fileContents);
  } else {
    throw new ImportError("Unrecognized file extension/format");
  }
}

