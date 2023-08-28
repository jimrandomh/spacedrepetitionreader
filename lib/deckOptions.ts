import { Deck } from "@prisma/client";

export type ReviewStatusType = "active"|"paused"

export interface DeckOptions {
  reviewStatus: ReviewStatusType
}

export const defaultDeckOptions: DeckOptions = {
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
  const result: Partial<DeckOptions> = {};

  for (const key of Object.keys(defaultDeckOptions)) {
    if (key in config) {
      const typedKey = key as keyof DeckOptions;
      result[typedKey] = config[typedKey] as any;
    }
  }

  // TODO

  return config;
}

