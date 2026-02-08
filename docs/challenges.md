# Technical Challenges & Solutions

## 1. No Official APIs

Neither Yahoo Finance nor Google Finance provides a public REST API.

**Yahoo Finance:** I used the `yahoo-finance2` npm package — an unofficial wrapper that hits Yahoo's internal quote endpoints. It can break if Yahoo changes those internal APIs, so every call is wrapped in try-catch. On failure, the dashboard shows "N/A" instead of crashing.

**Google Finance:** I scrape the Google Finance quote page using Cheerio. The HTML selectors (like `[data-item="pe"]`) could break if Google changes their layout. Same approach — null fallback on any error.

**Why this approach?** There are paid APIs (like Alpha Vantage, Polygon.io), but the assignment required no API keys. Scraping + unofficial libs was the only viable option.

## 2. Rate Limiting & Caching

We're hitting external services that don't expect programmatic access. Too many requests → blocks.

**Solution:** In-memory TTL cache (15s) per ticker. When we fetch data for a ticker, it's stored in a Map with an expiry timestamp. Within 15 seconds, repeated requests serve from cache. This aligns with the frontend polling interval.

**Stale fallback:** If a fresh fetch fails but we have stale cached data, we return that instead of null. Better to show slightly old data than nothing.

## 3. Exponential Backoff Retry

Network requests sometimes fail transiently. Instead of immediately giving up, each fetch has a retry with exponential backoff (500ms → 1s). Maximum 2 attempts to keep response times reasonable.

## 4. Partial Failures

In a batch of 6 stocks, some might succeed and others fail. The whole dashboard shouldn't break.

Each ticker is fetched with its own try-catch inside `Promise.all`. Failed tickers return `{ cmp: null, peRatio: null, latestEarnings: null }`. The API includes a `partialFailure` flag, and the UI shows a warning banner while still rendering the table with "N/A" for failed rows.

## 5. Yahoo Finance – No Official API / Bundling Issues

Yahoo has no public API. The `yahoo-finance2` npm package is ESM-only and bundles Deno test files (`@std/testing/mock`), which caused Next.js webpack to fail with "Module not found".

**Fix:** Bypassed the package entirely. We now call Yahoo’s v8 chart API directly: `GET https://query1.finance.yahoo.com/v8/finance/chart/{ticker}` and read `chart.result[0].meta.regularMarketPrice` for CMP. No npm dependency, no bundling issues, same data source.

## 6. Real-Time Updates (Configurable)

Used `setInterval` inside a custom `useAutoRefresh` hook. Users can:
- Toggle auto-refresh ON/OFF
- Choose interval (5s / 15s / 30s / 60s)
- Trigger manual refresh

The cleanup function in `useEffect` prevents memory leaks.

## 7. CRUD Portfolio with localStorage

Portfolio isn't just static — users can add, edit, delete stocks and import from CSV. Changes persist in `localStorage` so they survive page refreshes.

The API now accepts POST with a custom stocks array, so the live enrichment works with any portfolio, not just the default JSON.

## 8. Why Next.js API Routes (not Express)

- Single codebase, single deployment
- No CORS issues (same origin)
- Vercel-native deployment
- Less infrastructure to manage

If the app grew larger, I'd consider a separate Express/Fastify backend for better separation of concerns.

## 9. What I'd Improve with Paid APIs

- **Alpha Vantage:** Reliable P/E, earnings, and CMP via REST with an API key
- **Polygon.io:** WebSocket for real-time price streams (instead of polling)
- **Redis caching:** Replace in-memory cache with Redis for multi-instance deployments
- **Database:** Store portfolio in PostgreSQL instead of localStorage for multi-device sync
