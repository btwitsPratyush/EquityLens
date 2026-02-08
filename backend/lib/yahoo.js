const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

async function getCmp(ticker) {
  try {
    const url = `${YAHOO_BASE}/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      console.warn(`[yahoo] HTTP ${res.status} for ${ticker}`);
      return null;
    }
    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (typeof price === "number" && price > 0) return price;
    return null;
  } catch (err) {
    console.warn(`[yahoo] failed for ${ticker}:`, err.message);
    return null;
  }
}

module.exports = { getCmp };
