import fs from "fs";
import { importFile } from "../server/import/importFile";
import { test, describe, expect } from "@jest/globals";

const testDataDir = 'test/exporteddata';


describe('importing', () => {
  test('imports an exported Anki deck', async () => {
    const ankiFile = fs.readFileSync(`${testDataDir}/anki_export.apkg`);
    const parsedImport = await importFile("anki_export.apkg", ankiFile);
    expect(parsedImport.decks.length).toBe(1);
    expect(parsedImport.decks[0].cards.length).toBe(4);
  });
});
