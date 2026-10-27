# Extract Noscript Content

Generates a static JSON article index at `public/article-index.json` for crawler and LLM search engine consumption without requiring JavaScript.

## Usage

```bash
npx tsx scripts/extract-noscript-content/script.ts
```

Runs automatically as part of the `prebuild` step.

## Output

Writes `public/article-index.json` with an array of published articles:

```json
[
  {
    "slug": "my-article",
    "title": "My Article",
    "description": "...",
    "date": "2025-01-15",
    "category": "software-craft",
    "tags": ["typescript", "react"],
    "author": "site-team",
    "url": "/blog/my-article"
  }
]
```

## Purpose

- Crawlers and LLM-based search engines can fetch `/article-index.json` to discover all articles
- The `<noscript>` fallback links to this file for non-JS clients
- Provides AEO (Answer Engine Optimization) benefits
