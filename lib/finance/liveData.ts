// combines yahoo + google data for a ticker, with caching + retry + stale fallback
import { createCache } from "@/lib/cache";
import { getCmp } from "./yahoo";
import { fetchGoogleData } from "./google";
import type { StockApiResponse } from "@/types";

interface LiveStockData {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
}

const cache = createCache<LiveStockData>();

// exponential backoff retry (2 attempts max to keep it fast)
async function withRetry<T>(fn: () => Promise<T>, retries = 1, delayMs = 500): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

export async function getTickerData(ticker: string): Promise<StockApiResponse> {
  // check cache first
  const cached = cache.get(ticker);
  if (cached) {
    return { ...cached, timestamp: new Date().toISOString() };
  }

  try {
    // fetch yahoo and google in parallel with retry
    const [cmp, gData] = await Promise.all([
      withRetry(() => getCmp(ticker)),
      withRetry(() => fetchGoogleData(ticker)),
    ]);

    const data: LiveStockData = {
      cmp,
      peRatio: gData.peRatio,
      latestEarnings: gData.latestEarnings,
    };

    cache.set(ticker, data);
    return { ...data, timestamp: new Date().toISOString() };
  } catch {
    // if fetch failed completely, try stale cache
    const stale = cache.getStale(ticker);
    if (stale) {
      console.log(`[liveData] using stale cache for ${ticker}`);
      return { ...stale, timestamp: new Date().toISOString() };
    }

    // nothing at all - return nulls
    return { cmp: null, peRatio: null, latestEarnings: null, timestamp: new Date().toISOString() };
  }
}

// batch fetch multiple tickers
export async function batchGetTickerData(
  tickers: string[]
): Promise<Map<string, LiveStockData>> {
  const unique = Array.from(new Set(tickers));

  const results = await Promise.all(
    unique.map(async (t) => {
      try {
        const res = await getTickerData(t);
        return { ticker: t, data: { cmp: res.cmp, peRatio: res.peRatio, latestEarnings: res.latestEarnings } };
      } catch {
        return { ticker: t, data: { cmp: null, peRatio: null, latestEarnings: null } as LiveStockData };
      }
    })
  );

  const map = new Map<string, LiveStockData>();
  for (const { ticker, data } of results) {
    map.set(ticker, data);
  }
  return map;
}
