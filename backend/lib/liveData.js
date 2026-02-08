const { createCache } = require("./cache");
const { getCmp } = require("./yahoo");
const { fetchGoogleData } = require("./google");

const cache = createCache(15_000);

async function withRetry(fn, retries = 1, delayMs = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

async function getTickerData(ticker) {
  const cached = cache.get(ticker);
  if (cached) return { ...cached, timestamp: new Date().toISOString() };
  try {
    const [cmp, gData] = await Promise.all([
      withRetry(() => getCmp(ticker)),
      withRetry(() => fetchGoogleData(ticker)),
    ]);
    const data = { cmp, peRatio: gData.peRatio, latestEarnings: gData.latestEarnings };
    cache.set(ticker, data);
    return { ...data, timestamp: new Date().toISOString() };
  } catch {
    const stale = cache.getStale(ticker);
    if (stale) return { ...stale, timestamp: new Date().toISOString() };
    return { cmp: null, peRatio: null, latestEarnings: null, timestamp: new Date().toISOString() };
  }
}

async function batchGetTickerData(tickers) {
  const unique = [...new Set(tickers)];
  const results = await Promise.all(
    unique.map(async (t) => {
      try {
        const res = await getTickerData(t);
        return { ticker: t, data: { cmp: res.cmp, peRatio: res.peRatio, latestEarnings: res.latestEarnings } };
      } catch {
        return { ticker: t, data: { cmp: null, peRatio: null, latestEarnings: null } };
      }
    })
  );
  const map = new Map();
  for (const { ticker, data } of results) map.set(ticker, data);
  return map;
}

module.exports = { getTickerData, batchGetTickerData };
