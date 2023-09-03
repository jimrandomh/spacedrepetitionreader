import type { ImportedFile } from "./importFile";
import { unpackZip } from "./importUtil";
import { parseXml, XmlElement, XmlNode } from '@rgrove/parse-xml';
import { ApiErrorImportFailed } from "../serverApiUtil";

/*
 * Import Mnemosine's format. This is a ZIP file containing files METADATA and
 * cards.xml. METADATA looks like this (random example file found on a deck-
 * sharing site):
 *    tags:
 *    author_email:
 *    notes:Source: Wikipedia, 2013-07-06
 *    author_name:Christopher Ryan
 *    card_set_name:National Capitals
 *    date:Sat Jul 6 2013
 *    revision:1
 * The XML file contains "log entries", described in
 *    https://github.com/mnemosyne-proj/mnemosyne/blob/master/openSM2sync/log_entry.py
 * Which uses a bunch of magic-numbered types, and which presents itself as an
 * edit-log rather than as a state.
 */

const MnemosineLogT = {
  STARTED_PROGRAM: 1,
  STOPPED_PROGRAM: 2,
  STARTED_SCHEDULER: 3,
  LOADED_DATABASE: 4,
  SAVED_DATABASE: 5,

  ADDED_CARD: 6,
  EDITED_CARD: 7,
  DELETED_CARD: 8,
  REPETITION: 9,

  ADDED_TAG: 10,
  EDITED_TAG: 11,
  DELETED_TAG: 12,

  ADDED_MEDIA_FILE: 13,
  EDITED_MEDIA_FILE: 14,
  DELETED_MEDIA_FILE: 15,

  // "Only relevant for fact-based clients."
  ADDED_FACT: 16,
  EDITED_FACT: 17,
  DELETED_FACT: 18,

  ADDED_FACT_VIEW: 19,
  EDITED_FACT_VIEW: 20,
  DELETED_FACT_VIEW: 21,

  ADDED_CARD_TYPE: 22,
  EDITED_CARD_TYPE: 23,
  DELETED_CARD_TYPE: 24,

  ADDED_CRITERION: 25,
  EDITED_CRITERION: 26,
  DELETED_CRITERION: 27,

  // "Optional."
  EDITED_SETTING: 28,
  WARNED_TOO_MANY_CARDS: 29,
};

type MnemosineTag = {
  id: string
  name: string
}
type MnemosineFact = {
  id: string
  front: string
  back: string
};
type MnemosineCard = {
  id: string
  tagIds: string[]
  factId: string
};

export async function importFileMnemomosine(filename: string, fileContents: Uint8Array): Promise<ImportedFile> {
  const zipFileContents = await unpackZip(fileContents);
  
  const metadataFile = zipFileContents.files["METADATA"].toString("utf-8");
  const _metadata = parseMnemosineMetadata(metadataFile);
  
  const xmlStr = zipFileContents.files["cards.xml"].toString("utf-8");
  const xml = parseXml(xmlStr);
  if (!xml.root) throw new ApiErrorImportFailed("XML file has no root element");
  
  const tagsById = new Map<string,MnemosineTag>();
  const factsById = new Map<string,MnemosineFact>();
  const cards: MnemosineCard[] = [];
  
  for (const entry of xml.root.children) {
    if (entry.type === XmlNode.TYPE_ELEMENT) {
      const element = entry as XmlElement;
      const id = element.attributes["o_id"];
      switch(parseInt(element.attributes["type"])) {
        case MnemosineLogT.ADDED_TAG: {
          const nameElement = getXmlChildElementNamed(element, "name");
          tagsById.set(id, {
            id,
            name: nameElement?.text ?? ""
          });
          break;
        }
        case MnemosineLogT.ADDED_FACT: {
          const frontElement = getXmlChildElementNamed(element, "f");
          const backElement = getXmlChildElementNamed(element, "b");
          factsById.set(id, {
            id,
            front: frontElement?.text ?? "",
            back: backElement?.text ?? "",
          });
          break;
        }
        case MnemosineLogT.ADDED_CARD: {
          const factId = element.attributes["fact"];
          const tagIds = element.attributes["tags"].split(",");
          cards.push({ id, tagIds, factId });
          break;
        }
        default:
          break;
      }
    }
  }
  
  const tagIds = [...tagsById.keys()];
  return {
    decks: tagIds.map(tagId => ({
      metadata: {
        name: tagsById.get(tagId)!.name,
      },
      cards: cards
        .filter(card => card.tagIds.find(t=>t===tagId))
        .map(card => ({
          front: factsById.get(card.factId)!.front,
          back: factsById.get(card.factId)!.back,
        }))
    }))
  };
}

function parseMnemosineMetadata(fileContents: string) {
  const lines = fileContents.split("\n");
  const metadata = new Map<string,string>();
  for (const line of lines) {
    const splitIndex = line.indexOf(":");
    if (splitIndex >= 0) {
      const key = line.substring(0, splitIndex);
      const value = line.substring(splitIndex+1);
      metadata.set(key, value);
    }
  }
  return metadata;
}

function getXmlChildElementNamed(element: XmlElement, childName: string): XmlElement|null {
  for (const child of element.children) {
    if (child.type === XmlNode.TYPE_ELEMENT) {
      const element = child as XmlElement;
      if (element.name === childName)
        return element;
    }
  }
  return null;
}
