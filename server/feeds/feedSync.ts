import { ServerApiContext } from '../serverApiUtil';
import { apiFilterRssItem } from '../api/feeds';
import { sanitizeHtml } from '../util/htmlUtil';
import RssParser, {Item as RssParserItem} from 'rss-parser';
import { Prisma, PrismaClient, RssFeed } from "@prisma/client";
import relToAbs from 'rel-to-abs';
import keyBy from 'lodash/keyBy';
import { registerCronjob } from '../util/cronUtil';

const feedRefreshIntervalMs = 1000*60*58; //58min

export async function maybeRefreshFeed(feed: RssFeed, db: PrismaClient) {
  const ageMs = new Date().getTime() - feed.lastSync.getTime();
  if (ageMs > feedRefreshIntervalMs) {
    await refreshFeed(feed, db);
  }
}

export async function pollFeed(feedUrl: string, ctx: ServerApiContext): Promise<ApiTypes.ApiObjRssItem[]> {
  const parser = new RssParser();
  const feed = await parser.parseURL(feedUrl);
  
  return feed.items.map(item => {
    const feedItem = rssParserToFeedItem(item, "feedId");
    return apiFilterRssItem({
      id: "",
      ...feedItem
    }, ctx);
  });
}

export async function refreshFeed(feed: RssFeed, db: PrismaClient) {
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
  
  const itemsToCreate: Prisma.RssItemUncheckedCreateInput[] = [];
  for (const item of feedResponse.items) {
    const translated = rssParserToFeedItem(item, feed.id);
    const matchingItem = existingItemsByRemoteId[translated.remoteId];
    if (translated.remoteId && matchingItem) {
      // TODO: Check if changed and maybe update
      //console.log(`Not replacing item in feed ${feed.id}`);
    } else {
      //console.log(`Creating item in feed ${feed.id}`);
      //console.log(item);
      itemsToCreate.push(translated);
    }
  }
  
  await db.rssItem.createMany({
    data: itemsToCreate,
  });
  
  await db.rssFeed.update({
    where: {id: feed.id},
    data: {lastSync: new Date()}
  });
}

function rssParserToFeedItem(item: {[key: string]: any} & RssParserItem, feedId: DbKey) {
  const content = item['content:encoded'] || item['content'] || item['summary'] || "";
  const remoteId = item.guid || item.id || item.link || item.pubDate || item.title || "";
  
  return {
    title: item.title || "",
    link: item.link || "",
    content: sanitizeHtml(relToAbs.convert(content, item.link)),
    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
    remoteId, feedId,
  };
}

export function feedURLToFeedTitle(feedUrl: string): string {
  const url = new URL(feedUrl);
  return url.hostname;
}

registerCronjob({
  name: "refreshFeeds",
  schedule: "0 18 * * * *", // Hourly, at :18
  fn: async ({db, intendedAt:_}) => {
    const feeds = await db.rssFeed.findMany({
      where: {},
      include: {
        _count: true,
        RssSubscription: {
          where: {
            deleted: false,
          },
        },
      },
    });
    
    const feedsToSync = feeds.filter(feed => feed.RssSubscription.length>0);
    for (const feed of feedsToSync) {
      await maybeRefreshFeed(feed, db);
    }
  }
});
