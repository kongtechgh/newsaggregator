// NewsAPI integration module
const NEWSAPI_BASE = 'https://newsapi.org/v2';

const CATEGORIES = ['general', 'business', 'technology', 'science', 'health', 'sports', 'entertainment'];

function getApiKey() {
  return localStorage.getItem('newsapi_key');
}

function setApiKey(key) {
  const trimmed = typeof key === 'string' ? key.trim() : '';
  if (trimmed) localStorage.setItem('newsapi_key', trimmed);
  else localStorage.removeItem('newsapi_key');
}

// Fetch top headlines by category
async function fetchTopHeadlines(category = 'general', country = 'us', pageSize = 20) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NewsAPI key not set');
  const safeCategory = CATEGORIES.includes(category) ? category : 'general';

  const params = new URLSearchParams({
    category: safeCategory,
    country,
    pageSize: String(pageSize),
    apiKey,
  });

  const res = await fetch(`${NEWSAPI_BASE}/top-headlines?${params}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `NewsAPI error: ${res.status}`);
  }

  const data = await res.json();
  return (data.articles || []).map(normalizeArticle);
}

// Search news by query
async function searchNews(query, sortBy = 'publishedAt', pageSize = 20) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NewsAPI key not set');

  const params = new URLSearchParams({
    q: query,
    sortBy,
    pageSize: String(pageSize),
    language: 'en',
    apiKey,
  });

  const res = await fetch(`${NEWSAPI_BASE}/everything?${params}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `NewsAPI error: ${res.status}`);
  }

  const data = await res.json();
  return (data.articles || []).map(normalizeArticle);
}

// Normalize a NewsAPI article to our common format
function normalizeArticle(article) {
  return {
    title: article.title || 'Untitled',
    description: article.description || '',
    url: article.url,
    imageUrl: article.urlToImage || null,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    sourceName: article.source?.name || 'Unknown',
    sourceUrl: article.url,
    origin: 'newsapi',
  };
}

export { CATEGORIES, getApiKey, setApiKey, fetchTopHeadlines, searchNews };
