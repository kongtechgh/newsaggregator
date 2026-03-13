// UI rendering module
import { getSourceInfo, getCredibilityBadge } from './sources.js';

// Format relative time
function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Create an article card element
function createArticleCard(article) {
  const sourceInfo = getSourceInfo(article.url) || getSourceInfo(article.sourceName);
  const badge = getCredibilityBadge(sourceInfo);

  const card = document.createElement('article');
  card.className = 'article-card';

  const imageHtml = article.imageUrl
    ? `<div class="card-image"><img src="${escapeHtml(article.imageUrl)}" alt="" loading="lazy" onerror="this.parentElement.remove()"></div>`
    : '';

  const biasLabel = sourceInfo?.bias ? `<span class="bias-tag">${escapeHtml(sourceInfo.bias)}</span>` : '';
  const originIcon = article.origin === 'rss' ? 'RSS' : 'API';

  card.innerHTML = `
    ${imageHtml}
    <div class="card-body">
      <div class="card-meta">
        <span class="badge ${badge.class}" title="${escapeHtml(badge.label)}">${badge.icon} ${escapeHtml(badge.label)}</span>
        ${biasLabel}
        <span class="origin-tag">${originIcon}</span>
      </div>
      <h3 class="card-title">
        <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a>
      </h3>
      <p class="card-description">${escapeHtml(article.description)}</p>
      <div class="card-footer">
        <span class="source-name">${escapeHtml(article.sourceName)}</span>
        <span class="card-time">${timeAgo(article.publishedAt)}</span>
      </div>
      <a href="${escapeHtml(article.url)}" class="source-link" target="_blank" rel="noopener noreferrer">
        Read at source &rarr;
      </a>
    </div>
  `;

  return card;
}

// Render a list of articles into the grid
function renderArticles(articles, container) {
  container.innerHTML = '';

  if (articles.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No articles found. Try a different category or check your API key.</p></div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const article of articles) {
    fragment.appendChild(createArticleCard(article));
  }
  container.appendChild(fragment);
}

// Show loading skeleton
function showLoading(container) {
  container.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'article-card skeleton';
    skeleton.innerHTML = `
      <div class="skeleton-image"></div>
      <div class="card-body">
        <div class="skeleton-line w60"></div>
        <div class="skeleton-line w90"></div>
        <div class="skeleton-line w75"></div>
        <div class="skeleton-line w40"></div>
      </div>
    `;
    container.appendChild(skeleton);
  }
}

// Show error message
function showError(container, message) {
  container.innerHTML = `<div class="error-state"><p>${escapeHtml(message)}</p></div>`;
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// Deduplicate articles by URL or similar titles
function deduplicateArticles(articles) {
  const seen = new Map();
  const result = [];

  for (const article of articles) {
    if (!article.url) continue;

    // Normalize URL for comparison
    const normalizedUrl = article.url.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
    if (seen.has(normalizedUrl)) continue;

    // Check for very similar titles
    const titleKey = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    if (titleKey.length > 10 && seen.has(titleKey)) {
      // Mark the existing article as having multiple sources
      const existing = seen.get(titleKey);
      if (!existing.otherSources) existing.otherSources = [];
      existing.otherSources.push(article.sourceName);
      continue;
    }

    seen.set(normalizedUrl, article);
    if (titleKey.length > 10) seen.set(titleKey, article);
    result.push(article);
  }

  return result;
}

// Sort articles
function sortArticles(articles, sortBy) {
  return [...articles].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.publishedAt?.getTime() || 0;
      const dateB = b.publishedAt?.getTime() || 0;
      return dateB - dateA;
    }
    if (sortBy === 'credibility') {
      const credOrder = { high: 3, 'medium-high': 2, medium: 1 };
      const infoA = getSourceInfo(a.url) || getSourceInfo(a.sourceName);
      const infoB = getSourceInfo(b.url) || getSourceInfo(b.sourceName);
      const scoreA = infoA?.verified ? (credOrder[infoA.credibility] || 0) : -1;
      const scoreB = infoB?.verified ? (credOrder[infoB.credibility] || 0) : -1;
      return scoreB - scoreA;
    }
    return 0;
  });
}

// Filter articles by search query
function filterArticles(articles, query) {
  if (!query) return articles;
  const q = query.toLowerCase();
  return articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.sourceName.toLowerCase().includes(q)
  );
}

export {
  renderArticles, showLoading, showError,
  deduplicateArticles, sortArticles, filterArticles,
  createArticleCard, timeAgo
};
