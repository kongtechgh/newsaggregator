// RSS feed fetching module using rss2json.com as a CORS proxy
const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json';

// Fetch and parse a single RSS feed
async function fetchRSSFeed(feedUrl, sourceName) {
  const params = new URLSearchParams({
    rss_url: feedUrl,
  });

  try {
    const res = await fetch(`${RSS2JSON_BASE}?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    if (data.status !== 'ok') return [];

    return (data.items || []).map(item => normalizeRSSItem(item, sourceName, data.feed));
  } catch (err) {
    console.warn(`Failed to fetch RSS feed ${sourceName}:`, err.message);
    return [];
  }
}

// Fetch multiple RSS feeds in parallel
async function fetchMultipleFeeds(feeds) {
  const results = await Promise.allSettled(
    feeds.map(feed => fetchRSSFeed(feed.url, feed.source))
  );

  const articles = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    }
  }
  return articles;
}

// Normalize an RSS item to our common article format
function normalizeRSSItem(item, sourceName, feedMeta) {
  // Strip HTML tags from description
  const description = (item.description || '')
    .replace(/<[^>]*>/g, '')
    .substring(0, 300);

  return {
    title: item.title || 'Untitled',
    description,
    url: item.link || item.guid,
    imageUrl: item.enclosure?.link || item.thumbnail || null,
    publishedAt: item.pubDate ? new Date(item.pubDate) : null,
    sourceName: sourceName || feedMeta?.title || 'Unknown',
    sourceUrl: item.link || item.guid,
    origin: 'rss',
  };
}

export { fetchRSSFeed, fetchMultipleFeeds };
