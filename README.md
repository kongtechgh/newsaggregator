# NewsLens — Verified News Aggregator

A client-side news aggregator that combines **NewsAPI** and **RSS** from vetted sources. Articles are deduplicated, sortable by date or credibility, and labeled with source credibility and bias so you can quickly see how trustworthy each story is.

## Features

- **Dual sources**: Headlines from [NewsAPI](https://newsapi.org/) plus RSS feeds from a curated list of credible outlets (Reuters, BBC, NPR, NYT, Guardian, etc.).
- **Credibility badges**: Each article shows whether the source is in the verified list (Highly Credible / Credible / Unverified) and an optional bias tag.
- **Categories**: General, Business, Technology, Science, Health, Sports, Entertainment.
- **Search**: Filter articles by title, description, or source name (client-side, instant).
- **Sort**: Newest first or most credible first.
- **Dark mode**: Toggle with preference stored in `localStorage`.
- **Responsive**: Works on desktop and mobile.

## Setup

1. **Open the app**  
   Serve the project over HTTP/HTTPS (e.g. with a local server or by opening `index.html` in a browser). Using a local server is recommended to avoid CORS issues with modules:
   ```bash
   npx serve .
   # or: python -m http.server 8000
   ```
2. **Get a NewsAPI key**  
   Register at [newsapi.org/register](https://newsapi.org/register) (free tier available).
3. **Enter your key**  
   On first load, the app prompts for your API key. It is stored **only in your browser’s `localStorage`**; no server or third party receives it. You can change it later via the “API Key” button.

## Project structure

```
newsaggregator/
├── index.html      # Single page, semantic HTML
├── css/
│   └── style.css   # Layout, theming, responsive styles
├── js/
│   ├── app.js      # Entry point, state, event handlers
│   ├── newsapi.js  # NewsAPI client and key storage
│   ├── rss.js      # RSS fetching via rss2json.com proxy
│   ├── sources.js  # Curated sources and credibility metadata
│   └── ui.js       # Rendering, dedup, sort, filter, XSS-safe escaping
└── README.md
```

## Security and privacy

- **API key**: Stored only in `localStorage` in your browser. Not sent to any server other than NewsAPI when fetching headlines.
- **XSS**: All article content (titles, descriptions, URLs, source names) is escaped before being inserted into the DOM (`escapeHtml` in `ui.js`).
- **External links**: Open with `target="_blank"` and `rel="noopener noreferrer"` to reduce tab-napping and referrer leakage.
- **RSS**: Feeds are fetched via [rss2json.com](https://rss2json.com); their privacy policy applies to those requests. No API key is sent to rss2json.

## Reliability

- **Graceful degradation**: NewsAPI and RSS are requested with `Promise.allSettled`; if one fails (e.g. bad key or network), the other still populates the grid.
- **Per-feed errors**: Individual RSS feed failures are caught and logged; other feeds still load.
- **Validation**: Category is validated against the allowed list before calling NewsAPI; invalid values fall back to `general`.

## Tech stack

- Vanilla JS (ES modules), no build step.
- CSS custom properties for theming and dark mode.
- No backend; runs entirely in the browser.

## License

Use and modify as you like. NewsAPI and RSS providers have their own terms; ensure your use complies with them.
