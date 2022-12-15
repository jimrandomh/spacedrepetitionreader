import RssParser from 'rss-parser';
import {sanitizeHtml} from '../htmlUtil';
import type {Express} from 'express';
import type {RssFeed} from '@prisma/client'
import {defineGetApi,definePostApi,assertLoggedIn,assertIsInt,assertIsString,ServerApiContext,ApiErrorNotImplemented} from '../serverApiUtil';


export function addFeedEndpoints(app: Express) {
  defineGetApi<ApiTypes.ApiLoadFeed>(app, "/api/feed/load/:feedUrl", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const {feedUrl} = ctx.query;
    const feedItems = await getFeed(feedUrl);
    return {feedItems};
  });

  defineGetApi<ApiTypes.ApiListSubscriptions>(app, "/api/feeds/subscribed", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const subscriptions = await ctx.db.rssSubscription.findMany({
      where: {
        userId: currentUser.id,
        deleted: false,
      },
      include: {feed: true}
    });
    
    return {
      feeds: subscriptions.map(subscription=>apiFilterRssFeed(subscription.feed, ctx)!)
    };
  });
  definePostApi<ApiTypes.ApiCreateFeed>(app, "/api/feeds/create", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
  definePostApi<ApiTypes.ApiSubscribeToFeed>(app, "/api/feeds/subscribe", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
  definePostApi<ApiTypes.ApiUnsubscribeFromFeed>(app, "/api/feeds/unsubscribe", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
  defineGetApi<ApiTypes.ApiGetRecentFeedItems>(app, "/api/feeds/:id/recent", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
  defineGetApi<ApiTypes.ApiGetUnreadFeedItems>(app, "/api/feeds/:id/unread", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
  definePostApi<ApiTypes.ApiMarkFeedItemRead>(app, "/api/feedItems/markAsRead", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
  definePostApi<ApiTypes.ApiMarkFeedItemUnread>(app, "/api/feedItems/markAsUnread", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
}


export async function getFeed(feedUrl: string): Promise<ApiTypes.FeedEntry[]> {
  let parser = new RssParser();
  let feed = await parser.parseURL(feedUrl);
  
  return feed.items.map(item => ({
    title: item.title ?? "",
    link: item.link ?? "",
    pubDate: item.pubDate ?? "",
    summary: sanitizeHtml(item.summary ?? ""),
    id: item.id ?? "",
  }));
}

function apiFilterRssFeed(feed: RssFeed|null, ctx: ServerApiContext): ApiTypes.ApiObjFeed|null {
  if (!feed) return null;
  return {
    id: feed.id,
    url: feed.rssUrl,
  };
}
