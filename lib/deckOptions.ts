import { Deck } from "@prisma/client";
import { filterKeys } from "./util/validationUtil";

type ReviewStatusType = "active"|"paused"

export interface DeckOptions {
  reviewStatus: ReviewStatusType
}

const defaultDeckOptions: DeckOptions = {
  reviewStatus: "active"
};

export const reviewStatusLabels: Record<ReviewStatusType,string> = {
  active: "Active",
  paused: "Paused",
};

export function getDeckOptions(deck: Deck|ApiTypes.ApiObjDeck): DeckOptions {
  return {
    ...defaultDeckOptions,
    ...(deck.config as Partial<DeckOptions>)
  };
}

export function validateDeckOptions(config: Partial<DeckOptions>): Partial<DeckOptions> {
  const result: Partial<DeckOptions> = filterKeys(config, defaultDeckOptions);
  // TODO
  return result;
}

