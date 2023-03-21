import cheerio from 'cheerio';

/// Given a URL that might be an RSS feed URL but might also be a bare domain,
/// try to figure out a corresponding RSS URL. Fetches URLs to try to find a
/// variant that works. Returns a feed URL or an error (not both).
///
/// Examples:
///   "example.com" -> "https://www.example.com/atom.xml"
///   "example2.com" -> "https://www.example.com/rss.xml"
///   "https://www.example.com/atom.xml" -> "https://www.example.com/atom.xml
export async function siteUrlToFeedUrl(urlString: string): Promise<
  {url: string, error: null}
  | {url: null, error: string}
> {
  // Handle trivial cases
  if (!urlString || urlString.trim().length===0) {
    return {url: null, error: "Feed URL was blank"};
  }
  if (urlString.startsWith("/")) {
    return {url: null, error: "Feed URL was relative but must be absolute"};
  }

  // If no protocol is specified, add https://. If a protocol other than http or
  // https is specified, error.
  const protocolPattern = /^([a-z]+):\/\//;
  const match = urlString.match(protocolPattern);
  if (match) {
    const protocol = match[1].toLowerCase();
    if (protocol !== "http" && protocol !== "https") {
      return {url: null, error: `Unrecognized protocol in feed URL: ${protocol}`};
    }
  } else {
    urlString = "https://" + urlString;
  }
  
  // Parse the URL
  const parsedUrl = new URL(urlString);
  
  // Load it. If what comes back looks like RSS or Atom XML, use this URL. If
  // it's HTML with a tag like
  //     <link rel="alternative" type="application/rss+xml" href="...">
  // then use the `href` attribute from that tag. Otherwise continue to fallback
  // cases.
  const fetchResult = await fetch(urlString);
  if (fetchResult.ok) {
    const body = await fetchResult.text();
    if (await resultIsFeed(fetchResult, body)) {
      return {url: urlString, error: null};
    }
    const extractedFeedUrl = await getFeedUrlFromFetchResult(fetchResult, body);
    if (extractedFeedUrl) {
      return {url: extractedFeedUrl, error: null};
    }
  }
  
  // If we don't have a working feed URL yet, and the URL doesn't have a path
  // in it (other than /), then try some common feed URLs
  if ((parsedUrl.pathname==="" || parsedUrl.pathname==="/")
    && !parsedUrl.search && !parsedUrl.hash)
  {
    const commonFeedPaths = ["/atom.xml", "/rss.xml", "/feed.xml", "/feed"];
    for (const path of commonFeedPaths) {
      const combinedUrl = new URL(path, parsedUrl)
      console.log(`Checking whether ${combinedUrl.toString()} is a feed`);
      const commonPathFetchResult = await fetch(combinedUrl.toString());
      if (commonPathFetchResult.ok) {
        const body = await commonPathFetchResult.text();
        if (await resultIsFeed(fetchResult, body)) {
          console.log(`Returning feed URL: ${combinedUrl.toString()}`);
          return { url: combinedUrl.toString(), error: null };
        }
      }
    }
  }
  
  // If we get this far without finding anything, give up
  return {url: null, error: `Could not determine feed URL for ${urlString}`};
}

/// Given the result of a fetch() call which might or might not have succeeded
/// and might or might not be XML for an RSS/Atom feed, return whether it was
/// successful and was the XML for an RSS/Atom feed.
async function resultIsFeed(fetchResult: Response, body: string): Promise<boolean> {
  if (!fetchResult.ok) {
    console.log(`Fetch of ${fetchResult.url} failed: ${fetchResult.status}`);
    return false;
  }
  return pageBodyIsFeed(body);
}

export function pageBodyIsFeed(body: string): boolean {
  return !!body.match(/^\s*(<\?xml[^>]*>\s*)?<\s*(rss|feed)/);
}

/// Given the result of a fetch() call which might or might not have succeeded
/// and might or might not be an HTML page with a reference to a corresponding
/// RSS feed in it, check for feed metadata. If found, return the feed URL.
/// Otherwise return null.
///
/// Looks for tags that look like:
///   <link rel="alternative" type="application/rss+xml" href="...">
async function getFeedUrlFromFetchResult(fetchResult: Response, body: string): Promise<string|null> {
  if (!fetchResult.ok) {
    console.log(`Fetch of ${fetchResult.url} failed: ${fetchResult.status}`);
    return null;
  }
  try {
    const $ = cheerio.load(body);
    const alternateLinks = $('link[rel="alternate"]').first();
  
    for (let i=0; i<alternateLinks.length; i++) {
      const alternateLink = alternateLinks[i];
      const href = $(alternateLink).attr("href");
      if (href) {
        return new URL(href, fetchResult.url).toString();
      }
    }
    console.log(`Page ${fetchResult.url} did not contain a feed URL`);
    return null;
  } catch(e) {
    console.log(`Parsing page ${fetchResult.url} failed: ${e}`);
    return null;
  }
}

