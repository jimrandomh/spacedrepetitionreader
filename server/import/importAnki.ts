import type { ImportedFile } from "../../lib/importTypes";
import { loadSqlite3fromBuffer, unpackZip } from "./importUtil";

/*

Import from Anki. Anki's .apkg format is a ZIP file containing a sqlite database
collection.anki21 (also .anki2, presumably this varies by version-number). The
schema of collection.anki21 is:

  CREATE TABLE col (  --{{_}}
    id integer PRIMARY KEY,
    crt integer NOT NULL,
    mod integer NOT NULL,
    scm integer NOT NULL,
    ver integer NOT NULL,
    dty integer NOT NULL,
    usn integer NOT NULL,
    ls integer NOT NULL,
    conf text NOT NULL,
    models text NOT NULL,
    decks text NOT NULL,
    dconf text NOT NULL,
    tags text NOT NULL
  );
  CREATE TABLE notes (  --{{_}}
    id integer PRIMARY KEY,
    guid text NOT NULL,
    mid integer NOT NULL,
    mod integer NOT NULL,
    usn integer NOT NULL,
    tags text NOT NULL,
    flds text NOT NULL,
    sfld integer NOT NULL,
    csum integer NOT NULL,
    flags integer NOT NULL,
    data text NOT NULL
  );
  CREATE TABLE cards (  --{{_}}
    id integer PRIMARY KEY,
    nid integer NOT NULL,
    did integer NOT NULL,
    ord integer NOT NULL,
    mod integer NOT NULL,
    usn integer NOT NULL,
    type integer NOT NULL,
    queue integer NOT NULL,
    due integer NOT NULL,
    ivl integer NOT NULL,
    factor integer NOT NULL,
    reps integer NOT NULL,
    lapses integer NOT NULL,
    left integer NOT NULL,
    odue integer NOT NULL,
    odid integer NOT NULL,
    flags integer NOT NULL,
    data text NOT NULL
  );
  CREATE TABLE revlog (  --{{_}}
    id integer PRIMARY KEY,
    cid integer NOT NULL,
    usn integer NOT NULL,
    ease integer NOT NULL,
    ivl integer NOT NULL,
    lastIvl integer NOT NULL,
    factor integer NOT NULL,
    time integer NOT NULL,
    type integer NOT NULL
  );

Documentation:
  https://github.com/SergioFacchini/anki-cards-web-browser/blob/master/documentation/Processing%20Anki's%20.apkg%20files.md
*/

export async function importFileAnki(filename: string, fileContents: Uint8Array): Promise<ImportedFile> {
  const zipFileContents = await unpackZip(fileContents);
  const anki21sqliteBin = zipFileContents.files["collection.anki21"];

  const db = loadSqlite3fromBuffer(anki21sqliteBin);
  //const queryResult = db.prepare('SELECT * FROM notes').get();
  //console.log(queryResult);
  
  const notes = db.prepare("SELECT * FROM notes").get();
  const cards = db.prepare("SELECT * FROM cards").get();
  
  return {
    decks: [
      //TODO
    ],
  };
}
