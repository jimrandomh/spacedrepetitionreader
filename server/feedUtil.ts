import RssParser from 'rss-parser';
import {FeedEntry} from '../lib/apiTypes';
import {sanitizeHtml} from './htmlUtil';

export async function getFeed(feedUrl: string): Promise<FeedEntry[]> {
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
