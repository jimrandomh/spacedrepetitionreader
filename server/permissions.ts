import { Deck, User, RssFeed, RssSubscription, RssItem } from "@prisma/client";
import { getSubscriptionOptions } from "../lib/subscriptionOptions";
import { postprocessFeedHtml } from './util/htmlUtil';
import type { ServerApiContext } from "./serverApiUtil";

export function userCanViewDeck(user: User, deck: Deck) {
  return deck.authorId === user.id;
}

export function userCanEditDeck(user: User, deck: Deck) {
  return deck.authorId === user.id;
}

export function userCanViewFeed(_user: User, _feed: RssFeed) {
  return true;
}

export function userCanEditSubscription(user: User, subscription: RssSubscription) {
  return subscription.userId === user.id;
}


export function apiFilterRssFeed(feed: RssFeed, _ctx: ServerApiContext): ApiTypes.ApiObjFeed {
  return {
    id: feed.id,
    url: feed.rssUrl,
    title: feed.title,
  };
}

export function apiFilterRssItem(item: RssItem, _ctx: ServerApiContext): ApiTypes.ApiObjRssItem {
  return {
    id: item.id,
    feedId: item.feedId,
    title: item.title,
    link: item.link,
    pubDate: item.pubDate.toISOString(),
    summary: postprocessFeedHtml(item.content),
  }
}

export function apiFilterSubscription(subscription: RssSubscription, _ctx: ServerApiContext): ApiTypes.ApiObjSubscription {
  return {
    id: subscription.id,
    feedId: subscription.feedId,
    userId: subscription.userId,
    config: getSubscriptionOptions(subscription),
  };
}

