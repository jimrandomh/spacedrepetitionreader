import JSZip from "jszip";
import sqlite3, { Database }  from 'better-sqlite3';

interface ZipFileContents {
  files: Record<string,Buffer>
}

export async function unpackZip(data: Uint8Array): Promise<ZipFileContents> {
  const jszip = new JSZip();
  const loadedZip = await jszip.loadAsync(data);
  const result: ZipFileContents = {
    files: {}
  };

  for (const path of Object.keys(loadedZip.files)) {
    result.files[path] = await loadedZip.files[path].async("nodebuffer");
  }
  
  return result;
}

export function loadSqlite3fromBuffer(buffer: Buffer): Database {
  // The DefinitelyTyped definision of this constructor is wrong, thinks the
  // first arg has to be a filename (but it can be a Buffer)
  // @ts-ignore
  return sqlite3(buffer, {});
}
