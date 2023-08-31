import JSZip from "jszip";
import { ApiErrorNotImplemented } from "../serverApiUtil";
import sqlite3, { Database }  from 'better-sqlite3';

export interface ImportedCard {
  front: string
  back: string
}

export interface ImportedDeck {
  name: string
  cards: ImportedCard[]
}

export interface ImportedFile {
  decks: ImportedDeck[]
}

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function importFile(filename: string, fileContents: Uint8Array): Promise<ImportedFile> {
  if (filename.endsWith(".apkg")) {
    return await importFileAnki(filename, fileContents);
  } else {
    throw new ImportError("Unrecognized file extension/format");
  }
}

async function importFileAnki(filename: string, fileContents: Uint8Array): Promise<ImportedFile> {
  const zipFileContents = await unpackZip(fileContents);
  const anki21sqliteBin = zipFileContents.files["collection.anki21"];

  const db = loadSqlite3fromBuffer(anki21sqliteBin);
  //const queryResult = db.prepare('SELECT * FROM notes').get();
  //console.log(queryResult);
  
  // TODO
  
  throw new ApiErrorNotImplemented;
}

interface ZipFileContents {
  files: Record<string,Buffer>
}

async function unpackZip(data: Uint8Array): Promise<ZipFileContents> {
  const jszip = new JSZip();
  const loadedZip = await jszip.loadAsync(data);
  let totalSize = 0;
  let result: ZipFileContents = {
    files: {}
  };

  for (const path of Object.keys(loadedZip.files)) {
    console.log(`Unpacking ${path}`);
    result.files[path] = await loadedZip.files[path].async("nodebuffer");
  }
  
  return result;
}

function loadSqlite3fromBuffer(buffer: Buffer): Database {
  // The DefinitelyTyped definision of this constructor is wrong, thinks the
  // first arg has to be a filename (but it can be a Buffer)
  // @ts-ignore
  return sqlite3(anki21sqliteBin, {});
}
