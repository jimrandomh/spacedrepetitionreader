import type {Express} from 'express';
import type { PrismaClient, User, RssFeed, RssItem, RssSubscription } from '@prisma/client'
import {defineGetApi,definePostApi,assertLoggedIn,assertIsKey,assertIsString,ServerApiContext,ApiErrorNotFound, ApiErrorAccessDenied} from '../serverApiUtil';
import { siteUrlToFeedUrl } from '../feeds/findFeedForPage';
import { userCanEditSubscription, userCanViewFeed } from '../permissions';
import { awaitAll } from '../../lib/util/asyncUtil';
import { feedURLToFeedTitle, maybeRefreshFeed, pollFeed, refreshFeed } from '../feeds/feedSync';
import { validateSubscriptionOptions } from '../../lib/subscriptionOptions';
import { getSubscriptionOptions } from "../../lib/subscriptionOptions";

const maxParallelism = 10;

export function addFeedEndpoints(app: Express) {
  defineGetApi<ApiTypes.ApiPollFeed>(app, "/api/feed/poll/:feedUrl", async (ctx) => {
    assertLoggedIn(ctx);
    const {feedUrl} = ctx.query;
    const feedItems = await pollFeed(feedUrl, ctx);
    return {feedItems};
  });
  
  definePostApi<ApiTypes.ApiRefreshFeed>(app, "/api/feed/refresh", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const feedId = assertIsKey(ctx.body.feedId);
    const feed = await ctx.db.rssFeed.findUnique({where:{id: feedId}});

    if (!feed) {
      throw new ApiErrorNotFound;
    }
    if (!userCanViewFeed(currentUser, feed)) {
      throw new ApiErrorAccessDenied;
    }

    await refreshFeed(feed, ctx.db);
    return {};
  });
  
  definePostApi<ApiTypes.ApiMarkAllAsRead>(app, "/api/feed/markAsRead", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const feedId = assertIsKey(ctx.body.feedId);
    
    const items = await ctx.db.rssItem.findMany({
      where: {feedId: feedId}
    });
    await awaitAll(items.map(item => async () => markAsRead(currentUser, item, ctx)), maxParallelism);
    return {};
  });
  
  defineGetApi<ApiTypes.ApiLoadFeed>(app, "/api/feed/load/:feedId", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const feedId = assertIsKey(ctx.query.feedId);

    const feed = await ctx.db.rssFeed.findUnique({
      where: {id: feedId}
    });
    if (!feed) {
      throw new ApiErrorNotFound;
    }
    const subscriptions = await ctx.db.rssSubscription.findMany({
      where: {
        feedId: feed.id,
        userId: currentUser.id,
      },
    });

    if (!userCanViewFeed(currentUser, feed)) {
      throw new ApiErrorAccessDenied;
    }
    await maybeRefreshFeed(feed, ctx.db);
    
    const feedItems = await getUnreadItems(currentUser, feed, ctx.db);
    return {
      feed: apiFilterRssFeed(feed, ctx),
      feedItems: feedItems.map(item => apiFilterRssItem(item, ctx)),
      subscription: apiFilterSubscription(subscriptions?.[0], ctx),
    };
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
    
    const unreadCountsByFeedId: Record<DbKey,number> = {};
    await awaitAll(subscriptions.map(subscription => async () => {
      unreadCountsByFeedId[subscription.feed.id] = await getUnreadCount(currentUser, subscription.feed, ctx)
    }), 10);
    
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
          title: feedURLToFeedTitle(feedUrl),
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
          config: {},
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
  defineGetApi<ApiTypes.ApiGetRecentFeedItems>(app, "/api/feeds/:feedId/recent", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const feedId = assertIsKey(ctx.query.feedId);
    const feed = await ctx.db.rssFeed.findUnique({ where: {id: feedId} });
    if (!feed) {
      throw new ApiErrorNotFound;
    }
    if (!userCanViewFeed(currentUser, feed)) {
      throw new ApiErrorAccessDenied;
    }
    const items = await ctx.db.rssItem.findMany({
      where: { feedId },
      orderBy: { pubDate: 'desc' },
    });
    return {
      items: items.map(item => apiFilterRssItem(item, ctx))
    };
  });
  defineGetApi<ApiTypes.ApiGetUnreadFeedItems>(app, "/api/feeds/:feedId/unread", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const feedId = assertIsKey(ctx.query.feedId);
    const feed = await ctx.db.rssFeed.findUnique({where: {id: feedId}});
    if (!feed) {
      throw new ApiErrorNotFound();
    }
    if (!userCanViewFeed(currentUser, feed)) {
      throw new ApiErrorAccessDenied;
    }
    const unreadItems = await getUnreadItems(currentUser, feed, ctx.db)
    return {
      items: unreadItems.map(item => apiFilterRssItem(item, ctx))
    }
  });
  
  defineGetApi<ApiTypes.ApiGetFeedPreview>(app, "/api/feeds/preview/:url", async (ctx) => {
    const url = assertIsString(ctx.query.url);
    const {url: feedUrl, error} = await siteUrlToFeedUrl(url);
    if (!feedUrl) {
      return {
        success: false,
        url: null, error,
        items: [],
      }
    }
    
    return {
      success: true,
      url: feedUrl, error: null,
      items: await pollFeed(feedUrl, ctx),
    };
  });
  
  definePostApi<ApiTypes.ApiMarkFeedItemRead>(app, "/api/feedItems/markAsRead", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    const rssItemId = assertIsKey(ctx.body.itemId);

    const rssItem = await ctx.db.rssItem.findUnique({
      where: {id: rssItemId},
      include: {
        feed: true,
      }
    });
    if (!rssItem) {
      throw new ApiErrorNotFound();
    }
    if (!userCanViewFeed(currentUser, rssItem.feed)) {
      throw new ApiErrorAccessDenied;
    }
    await markAsRead(currentUser, rssItem, ctx);
    return {};
  });
  
  definePostApi<ApiTypes.ApiEditSubscriptionOptions>(app, "/api/feeds/edit", async (ctx) => {
    const subscriptionId = assertIsKey(ctx.body.subscriptionId);
    const config = validateSubscriptionOptions(ctx.body.config);
    const currentUser = assertLoggedIn(ctx);
    
    const subscription = await ctx.db.rssSubscription.findUnique({
      where: {id: subscriptionId}
    });
    
    if (!subscription) {
      throw new ApiErrorNotFound();
    }
    if (!userCanEditSubscription(currentUser, subscription)) {
      throw new ApiErrorAccessDenied();
    }
    
    await ctx.db.rssSubscription.update({
      where: { id: subscriptionId },
      data: { config },
    });

    return {};
  });
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
    feedId: item.feedId,
    title: item.title,
    link: item.link,
    pubDate: item.pubDate.toISOString(),
    summary: item.content,
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


async function getUnreadCount(user: User, feed: RssFeed, ctx: ServerApiContext): Promise<number> {
  return await ctx.db.rssItem.count({
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
    },
    orderBy: {
      pubDate: "desc",
    },
  });
}

