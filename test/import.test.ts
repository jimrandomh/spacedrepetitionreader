import fs from "fs";
import { importFile } from "../server/import/importFile";

const testDataDir = 'test/exporteddata';


test('imports an exported Anki deck', async () => {
  const ankiFile = fs.readFileSync(`${testDataDir}/anki_export.apkg`);
  const parsedImport = await importFile("anki_export.apkg", ankiFile);
  assert(parsedImport.decks.length===1);
  assert(parsedImprot.decks[0].cards.length===4);
});
