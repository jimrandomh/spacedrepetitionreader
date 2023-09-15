import { RssSubscription } from "@prisma/client";
import { filterKeys } from "./util/validationUtil";

export type FeedPresentationOrderType = "oldestFirst"|"newestFirst"|"random"

export interface SubscriptionOptions {
  presentationOrder: FeedPresentationOrderType
  shuffleIntoReviews: boolean
  blockDirectAccess: boolean
}
export const defaultSubscriptionOptions: SubscriptionOptions = {
  presentationOrder: "oldestFirst",
  shuffleIntoReviews: true,
  blockDirectAccess: false,
};

export const feedPresentationOrderLabels: Record<FeedPresentationOrderType,string> = {
  "oldestFirst": "Oldest First",
  "newestFirst": "Newest First",
  "random": "Random",
}

export function getSubscriptionOptions(subscription: RssSubscription|ApiTypes.ApiObjSubscription): SubscriptionOptions {
  return {
    ...defaultSubscriptionOptions,
    ...(subscription.config as Partial<SubscriptionOptions>)
  };
}

export function validateSubscriptionOptions(config: Partial<SubscriptionOptions>): Partial<SubscriptionOptions> {
  const result: Partial<SubscriptionOptions> = filterKeys(config, defaultSubscriptionOptions);

  return result;
}
