import fs from "fs";
import { importFile } from "../server/import/importFile";
import { test, describe, expect } from "@jest/globals";

const testDataDir = 'test/exporteddata';


describe('importing', () => {
  /*test('imports anki_export.apkg (Anki)', async () => {
    const ankiFile = fs.readFileSync(`${testDataDir}/anki_export.apkg`);
    const parsedImport = await importFile("anki_export.apkg", ankiFile);
    expect(parsedImport.decks.length).toBe(1);
    expect(parsedImport.decks[0].cards.length).toBe(4);
  });*/
  test('imports national-capital.cards (Mnemosine)', async () => {
    const mnemosineFile = fs.readFileSync(`${testDataDir}/national-capitals.cards`);
    const parsedImport = await importFile("national-capitals.cards", mnemosineFile);
    expect(parsedImport.decks.length).toBe(1);
    expect(parsedImport.decks[0].metadata.name).toBe("National Capitals");
    expect(parsedImport.decks[0].cards.length).toBe(251);
    expect(parsedImport.decks[0].cards[0].front).toBe("What is the capital of Abkhazia?");
    expect(parsedImport.decks[0].cards[0].back).toBe("Sukhumi");
  });
});
