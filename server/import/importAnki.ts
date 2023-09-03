import { ApiErrorNotImplemented } from "../serverApiUtil";
import type { ImportedFile } from "./importFile";
import { loadSqlite3fromBuffer, unpackZip } from "./importUtil";

export async function importFileAnki(filename: string, fileContents: Uint8Array): Promise<ImportedFile> {
  const zipFileContents = await unpackZip(fileContents);
  const anki21sqliteBin = zipFileContents.files["collection.anki21"];

  const _db = loadSqlite3fromBuffer(anki21sqliteBin);
  //const queryResult = db.prepare('SELECT * FROM notes').get();
  //console.log(queryResult);
  
  // TODO
  
  throw new ApiErrorNotImplemented;
}
