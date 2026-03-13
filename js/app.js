// Main application module
import { CATEGORIES, getApiKey, setApiKey, fetchTopHeadlines, searchNews } from './newsapi.js';
import { fetchMultipleFeeds } from './rss.js';
import { getRSSFeeds } from './sources.js';
import {
  renderArticles, showLoading, showError,
  deduplicateArticles, sortArticles, filterArticles
} from './ui.js';

// App state
const state = {
  articles: [],
  filteredArticles: [],
  currentCategory: 'general',
  currentSort: 'date',
  searchQuery: '',
  loading: false,
  darkMode: localStorage.getItem('darkMode') === 'true',
};

// DOM references
let grid, searchInput, sortSelect, categoryTabs, apiKeyModal, apiKeyInput, themeToggle, sourceCountEl;

// Initialize the app
function init() {
  grid = document.getElementById('articles-grid');
  searchInput = document.getElementById('search-input');
  sortSelect = document.getElementById('sort-select');
  categoryTabs = document.getElementById('category-tabs');
  apiKeyModal = document.getElementById('api-key-modal');
  apiKeyInput = document.getElementById('api-key-input');
  themeToggle = document.getElementById('theme-toggle');
  sourceCountEl = document.getElementById('source-count');

  // Apply saved theme
  if (state.darkMode) document.body.classList.add('dark');

  // Build category tabs
  buildCategoryTabs();

  // Event listeners
  searchInput.addEventListener('input', debounce(onSearch, 300));
  sortSelect.addEventListener('change', onSortChange);
  themeToggle.addEventListener('click', toggleTheme);

  document.getElementById('api-key-form').addEventListener('submit', onApiKeySubmit);
  document.getElementById('change-api-key').addEventListener('click', showApiKeyModal);

  // Check for API key
  if (!getApiKey()) {
    showApiKeyModal();
  } else {
    loadArticles();
  }
}

// Build category tab buttons
function buildCategoryTabs() {
  categoryTabs.innerHTML = '';
  for (const cat of CATEGORIES) {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${cat === state.currentCategory ? 'active' : ''}`;
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.dataset.category = cat;
    btn.addEventListener('click', () => onCategoryChange(cat));
    categoryTabs.appendChild(btn);
  }
}

// Load articles from both NewsAPI and RSS feeds
async function loadArticles() {
  if (state.loading) return;
  state.loading = true;
  showLoading(grid);

  try {
    // Fetch from both sources in parallel
    const [newsApiArticles, rssArticles] = await Promise.allSettled([
      fetchTopHeadlines(state.currentCategory).catch(err => {
        console.warn('NewsAPI fetch failed:', err.message);
        return [];
      }),
      fetchMultipleFeeds(getRSSFeeds()).catch(err => {
        console.warn('RSS fetch failed:', err.message);
        return [];
      }),
    ]);

    const allArticles = [
      ...(newsApiArticles.status === 'fulfilled' ? newsApiArticles.value : []),
      ...(rssArticles.status === 'fulfilled' ? rssArticles.value : []),
    ];

    if (allArticles.length === 0) {
      showError(grid, 'No articles loaded. Check your API key or try again later.');
      state.loading = false;
      return;
    }

    state.articles = deduplicateArticles(allArticles);
    updateSourceCount();
    applyFiltersAndRender();
  } catch (err) {
    showError(grid, `Failed to load news: ${err.message}`);
  } finally {
    state.loading = false;
  }
}

// Apply current filters and sorting, then render
function applyFiltersAndRender() {
  let articles = state.articles;
  articles = filterArticles(articles, state.searchQuery);
  articles = sortArticles(articles, state.currentSort);
  state.filteredArticles = articles;
  renderArticles(articles, grid);
}

// Update the source count display
function updateSourceCount() {
  const sources = new Set(state.articles.map(a => a.sourceName));
  if (sourceCountEl) {
    sourceCountEl.textContent = `${state.articles.length} articles from ${sources.size} sources`;
  }
}

// Event handlers
function onCategoryChange(category) {
  state.currentCategory = category;
  // Update active tab
  categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  loadArticles();
}

function onSearch() {
  state.searchQuery = searchInput.value.trim();
  applyFiltersAndRender();
}

function onSortChange() {
  state.currentSort = sortSelect.value;
  applyFiltersAndRender();
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('dark', state.darkMode);
  localStorage.setItem('darkMode', state.darkMode);
}

function onApiKeySubmit(e) {
  e.preventDefault();
  const key = apiKeyInput.value.trim();
  if (key) {
    setApiKey(key);
    apiKeyModal.classList.add('hidden');
    loadArticles();
  }
}

function showApiKeyModal() {
  apiKeyInput.value = getApiKey() || '';
  apiKeyModal.classList.remove('hidden');
}

// Utility: debounce
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
