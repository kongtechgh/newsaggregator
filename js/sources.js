// Credible news source registry with metadata
const CREDIBLE_SOURCES = {
  // Wire services / agencies
  'reuters.com': { name: 'Reuters', type: 'wire', credibility: 'high', bias: 'center', rss: 'https://www.reutersagency.com/feed/' },
  'apnews.com': { name: 'Associated Press', type: 'wire', credibility: 'high', bias: 'center', rss: 'https://rsshub.app/apnews/topics/apf-topnews' },

  // Public broadcasters
  'bbc.com': { name: 'BBC News', type: 'public', credibility: 'high', bias: 'center-left', rss: 'https://feeds.bbci.co.uk/news/rss.xml' },
  'bbc.co.uk': { name: 'BBC News', type: 'public', credibility: 'high', bias: 'center-left', rss: 'https://feeds.bbci.co.uk/news/rss.xml' },
  'npr.org': { name: 'NPR', type: 'public', credibility: 'high', bias: 'center-left', rss: 'https://feeds.npr.org/1001/rss.xml' },
  'pbs.org': { name: 'PBS NewsHour', type: 'public', credibility: 'high', bias: 'center', rss: 'https://www.pbs.org/newshour/feeds/rss/headlines' },

  // Major newspapers
  'nytimes.com': { name: 'The New York Times', type: 'newspaper', credibility: 'high', bias: 'center-left', rss: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml' },
  'washingtonpost.com': { name: 'The Washington Post', type: 'newspaper', credibility: 'high', bias: 'center-left', rss: null },
  'wsj.com': { name: 'The Wall Street Journal', type: 'newspaper', credibility: 'high', bias: 'center-right', rss: null },
  'theguardian.com': { name: 'The Guardian', type: 'newspaper', credibility: 'high', bias: 'center-left', rss: 'https://www.theguardian.com/world/rss' },
  'usatoday.com': { name: 'USA Today', type: 'newspaper', credibility: 'medium-high', bias: 'center', rss: null },

  // Business / finance
  'bloomberg.com': { name: 'Bloomberg', type: 'business', credibility: 'high', bias: 'center', rss: null },
  'cnbc.com': { name: 'CNBC', type: 'business', credibility: 'medium-high', bias: 'center', rss: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  'ft.com': { name: 'Financial Times', type: 'business', credibility: 'high', bias: 'center', rss: null },

  // International
  'aljazeera.com': { name: 'Al Jazeera', type: 'international', credibility: 'medium-high', bias: 'center', rss: 'https://www.aljazeera.com/xml/rss/all.xml' },
  'dw.com': { name: 'Deutsche Welle', type: 'international', credibility: 'high', bias: 'center', rss: 'https://rss.dw.com/rdf/rss-en-all' },
  'france24.com': { name: 'France 24', type: 'international', credibility: 'high', bias: 'center', rss: 'https://www.france24.com/en/rss' },

  // Tech
  'techcrunch.com': { name: 'TechCrunch', type: 'tech', credibility: 'medium-high', bias: 'center', rss: 'https://techcrunch.com/feed/' },
  'arstechnica.com': { name: 'Ars Technica', type: 'tech', credibility: 'high', bias: 'center', rss: 'https://feeds.arstechnica.com/arstechnica/index' },
  'theverge.com': { name: 'The Verge', type: 'tech', credibility: 'medium-high', bias: 'center-left', rss: 'https://www.theverge.com/rss/index.xml' },

  // News networks
  'cnn.com': { name: 'CNN', type: 'network', credibility: 'medium-high', bias: 'center-left', rss: 'http://rss.cnn.com/rss/cnn_topstories.rss' },
  'abcnews.go.com': { name: 'ABC News', type: 'network', credibility: 'medium-high', bias: 'center', rss: 'https://abcnews.go.com/abcnews/topstories' },
  'cbsnews.com': { name: 'CBS News', type: 'network', credibility: 'medium-high', bias: 'center', rss: 'https://www.cbsnews.com/latest/rss/main' },
  'nbcnews.com': { name: 'NBC News', type: 'network', credibility: 'medium-high', bias: 'center-left', rss: null },

  // Science
  'nature.com': { name: 'Nature', type: 'science', credibility: 'high', bias: 'center', rss: 'https://www.nature.com/nature.rss' },
  'sciencemag.org': { name: 'Science', type: 'science', credibility: 'high', bias: 'center', rss: null },
  'scientificamerican.com': { name: 'Scientific American', type: 'science', credibility: 'high', bias: 'center', rss: null },
};

// Extract domain from a URL
function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname;
  } catch {
    return null;
  }
}

// Look up source info for a given URL or source name
function getSourceInfo(urlOrName) {
  if (!urlOrName) return null;

  // Try direct domain lookup
  const domain = extractDomain(urlOrName);
  if (domain && CREDIBLE_SOURCES[domain]) {
    return { ...CREDIBLE_SOURCES[domain], domain, verified: true };
  }

  // Try partial domain match (e.g. "news.bbc.co.uk" -> "bbc.co.uk")
  if (domain) {
    for (const [key, value] of Object.entries(CREDIBLE_SOURCES)) {
      if (domain.endsWith(key)) {
        return { ...value, domain: key, verified: true };
      }
    }
  }

  // Try matching by source name
  const nameLower = urlOrName.toLowerCase();
  for (const [key, value] of Object.entries(CREDIBLE_SOURCES)) {
    if (value.name.toLowerCase() === nameLower) {
      return { ...value, domain: key, verified: true };
    }
  }

  return null;
}

// Get credibility badge info
function getCredibilityBadge(sourceInfo) {
  if (!sourceInfo || !sourceInfo.verified) {
    return { label: 'Unverified', class: 'badge-unverified', icon: '?' };
  }
  switch (sourceInfo.credibility) {
    case 'high':
      return { label: 'Highly Credible', class: 'badge-high', icon: '\u2713\u2713' };
    case 'medium-high':
      return { label: 'Credible', class: 'badge-medium', icon: '\u2713' };
    default:
      return { label: 'Source Listed', class: 'badge-low', icon: '\u2013' };
  }
}

// Get all RSS feed URLs from the registry
function getRSSFeeds() {
  const feeds = [];
  const seen = new Set();
  for (const [domain, info] of Object.entries(CREDIBLE_SOURCES)) {
    if (info.rss && !seen.has(info.rss)) {
      seen.add(info.rss);
      feeds.push({ url: info.rss, source: info.name, domain });
    }
  }
  return feeds;
}

export { CREDIBLE_SOURCES, extractDomain, getSourceInfo, getCredibilityBadge, getRSSFeeds };
