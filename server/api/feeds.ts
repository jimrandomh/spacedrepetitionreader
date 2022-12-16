import RssParser from 'rss-parser';
import {sanitizeHtml} from '../htmlUtil';
import type {Express} from 'express';
import type {PrismaClient,User,RssFeed,RssItem} from '@prisma/client'
import {defineGetApi,definePostApi,assertLoggedIn,assertIsKey,assertIsString,ServerApiContext,ApiErrorNotFound,ApiErrorNotImplemented} from '../serverApiUtil';
import keyBy from 'lodash/keyBy';

const feedRefreshIntervalMs = 1000*60*60; //1hr


export function addFeedEndpoints(app: Express) {
  defineGetApi<ApiTypes.ApiPollFeed>(app, "/api/feed/poll/:feedUrl", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const {feedUrl} = ctx.query;
    const feedItems = await pollFeed(feedUrl);
    return {feedItems};
  });
  
  definePostApi<ApiTypes.ApiRefreshFeed>(app, "/api/feed/refresh", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const id = assertIsKey(ctx.body.id);
    const feed = await ctx.db.rssFeed.findUnique({where:{id}});
    if (!feed) throw new ApiErrorNotFound;
    await refreshFeed(feed, ctx.db);
    return {};
  });
  
  definePostApi<ApiTypes.ApiMarkAllAsRead>(app, "/api/feed/markAsRead", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const feedId = assertIsKey(ctx.body.feedId);
    
    const items = await ctx.db.rssItem.findMany({
      where: {feedId: feedId}
    });
    await Promise.all(items.map(async item => markAsRead(currentUser, item, ctx)));
    return {};
  });
  
  defineGetApi<ApiTypes.ApiLoadFeed>(app, "/api/feed/load/:id", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const id = assertIsKey(ctx.query.id);
    const feed = await ctx.db.rssFeed.findUnique({where:{id}});
    if (!feed) throw new ApiErrorNotFound;
    await maybeRefreshFeed(feed, ctx.db);
    
    const feedItems = await loadCachedFeedItems(feed, ctx);
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
    
    const unreadCountsByFeedId: Record<number,number> = {};
    await Promise.all(subscriptions.map(async (subscription) => {
      unreadCountsByFeedId[subscription.feed.id] = await getUnreadCount(subscription.feed, ctx)
    }));
    
    return {
      feeds: subscriptions.map(subscription => ({
        ...apiFilterRssFeed(subscription.feed, ctx),
        unreadCount: unreadCountsByFeedId[subscription.feed.id],
      }))
    };
  });
  definePostApi<ApiTypes.ApiSubscribeToFeed>(app, "/api/feeds/subscribe", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const feedUrl = assertIsString(ctx.body.feedUrl);
    let feed: RssFeed|null = null;
    
    // Ensure that the feed exists in the DB
    feed = await ctx.db.rssFeed.findUnique({ where: {rssUrl: feedUrl} })
    if (!feed) {
      // TODO: Should be an upsert
      feed = await ctx.db.rssFeed.create({
        data: {
          rssUrl: feedUrl,
          title: feedUrl,
          lastSync: new Date("1970-01-01"),
        }
      });
    }
    
    // Ensure that the user is subscribed
    const subscriptions = await ctx.db.rssSubscription.findMany({
      where: {
        deleted: false,
        feedId: feed.id,
        userId: currentUser.id,
      }
    });
    if (!subscriptions || subscriptions.length<1) {
      // TODO: Should be an upsert
      await ctx.db.rssSubscription.create({
        data: {
          userId: currentUser.id,
          feedId: feed.id,
          deleted: false,
        }
      });
    }
    
    // Refresh the feed
    await refreshFeed(feed, ctx.db);
    
    return {
      feedId: feed.id
    };
  });
  definePostApi<ApiTypes.ApiUnsubscribeFromFeed>(app, "/api/feeds/unsubscribe", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const feedId = assertIsKey(ctx.body.feedId);
    
    await ctx.db.rssSubscription.updateMany({
      where: {
        userId: currentUser.id,
        feedId: feedId,
      },
      data: {
        deleted: true,
      }
    });
    
    return {};
  });
  defineGetApi<ApiTypes.ApiGetRecentFeedItems>(app, "/api/feeds/:id/recent", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
  defineGetApi<ApiTypes.ApiGetUnreadFeedItems>(app, "/api/feeds/:id/unread", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    throw new ApiErrorNotImplemented; //TODO
  });
  
  defineGetApi<ApiTypes.ApiGetFeedPreview>(app, "/api/feeds/preview/:url", async (ctx) => {
    const url = assertIsString(ctx.query.url);
    
    return {
      items: await pollFeed(url)
    };
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


export async function pollFeed(feedUrl: string): Promise<ApiTypes.ApiObjRssItem[]> {
  const parser = new RssParser();
  const feed = await parser.parseURL(feedUrl);
  
  return feed.items.map(item => ({
    title: item.title ?? "",
    link: item.link ?? "",
    pubDate: item.pubDate ?? "",
    summary: sanitizeHtml(item.content ?? ""),
    id: item.id ?? "",
  }));
}

function apiFilterRssFeed(feed: RssFeed, _ctx: ServerApiContext): ApiTypes.ApiObjFeed {
  return {
    id: feed.id,
    url: feed.rssUrl,
    title: feed.title,
  };
}

export function apiFilterRssItem(item: RssItem, _ctx: ServerApiContext): ApiTypes.ApiObjRssItem {
  return {
    id: item.id,
    title: item.title,
    link: item.link,
    pubDate: item.pubDate.toISOString(),
    summary: item.content,
  }
}


export async function maybeRefreshFeed(feed: RssFeed, db: PrismaClient) {
  const ageMs = new Date().getTime() - feed.lastSync.getTime();
  if (ageMs > feedRefreshIntervalMs) {
    await refreshFeed(feed, db);
  }
}

async function getUnreadCount(_feed: RssFeed, _ctx: ServerApiContext): Promise<number> {
  return 0; //TODO
}

async function refreshFeed(feed: RssFeed, db: PrismaClient) {
  console.log(`Refreshing feed ${feed.title}`);
  const parser = new RssParser();
  const feedResponse = await parser.parseURL(feed.rssUrl);
  
  if (feedResponse.title && feedResponse.title!=="" && feed.title !== feedResponse.title) {
    // If the site provided a title, use it
    await db.rssFeed.update({
      where: {id: feed.id},
      data: {title: feedResponse.title},
    });
  }
  
  
  const existingItems = await db.rssItem.findMany({
    where: {feedId: feed.id}
  });
  const existingItemsByRemoteId = keyBy(existingItems, item=>item.remoteId);
  
  await Promise.all(feedResponse.items.map(async (item) => {
    const matchingItem = existingItemsByRemoteId[item.remoteId];
    if (matchingItem) {
      // TODO: Check if changed and maybe update
    } else {
      console.log(`Creating item in feed ${feed.id}`);
      console.log(item);
      await db.rssItem.create({
        data: {
          title: item.title || "",
          link: item.link || "",
          content: sanitizeHtml(item.content || ""),
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          remoteId: item.id || "",
          feedId: feed.id,
        }
      });
    }
  }));
  
  await db.rssFeed.update({
    where: {id: feed.id},
    data: {lastSync: new Date()}
  });
}

async function loadCachedFeedItems(feed: RssFeed, ctx: ServerApiContext): Promise<ApiTypes.ApiObjRssItem[]> {
  const items = await ctx.db.rssItem.findMany({
    where: {feedId: feed.id}
  });
  
  return items.map(item => apiFilterRssItem(item, ctx));
}

async function markAsRead(user: User, item: RssItem, ctx: ServerApiContext): Promise<void> {
  const existingImpression = await ctx.db.rssImpression.findMany({
    where: { userId: user.id, rssItemId: item.id }
  });
  if (!existingImpression || !existingImpression.length) {
    await ctx.db.rssImpression.create({
      data: {
        userId: user.id,
        rssItemId: item.id,
      }
    });
  }
}

export async function getUnreadItems(user: User, feed: RssFeed, db: PrismaClient): Promise<RssItem[]> {
  return await db.rssItem.findMany({
    where: {
      feedId: feed.id,
      impressions: {
        none: {
          userId: user.id
        }
      }
    }
  });
}
