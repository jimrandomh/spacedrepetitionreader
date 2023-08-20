import { RssSubscription } from "@prisma/client";

export interface SubscriptionOptions {
  presentationOrder: "oldestFirst"|"newestFirst"|"random";
}
export const defaultSubscriptionOptions: SubscriptionOptions = {
  presentationOrder: "oldestFirst"
};

export function getSubscriptionOptions(subscription: RssSubscription): SubscriptionOptions {
  return {
    ...defaultSubscriptionOptions,
    ...(subscription.config as Partial<SubscriptionOptions>)
  };
}
