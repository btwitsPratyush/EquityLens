// fetch CMP (current market price) from Yahoo Finance
// Uses Yahoo's v8 chart API directly — no npm package needed
// The yahoo-finance2 package has Deno test files that break webpack, so we bypass it entirely

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

export async function getCmp(ticker: string): Promise<number | null> {
  try {
    const url = `${YAHOO_BASE}/${encodeURIComponent(ticker)}?interval=1d&range=1d`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 0 }, // no Next.js cache — always fresh
    });

    if (!res.ok) {
      console.warn(`[yahoo] HTTP ${res.status} for ${ticker}`);
      return null;
    }

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;

    if (typeof price === "number" && price > 0) {
      console.log(`[yahoo] ${ticker} → ₹${price.toFixed(2)}`);
      return price;
    }

    console.warn(`[yahoo] no price in response for ${ticker}`);
    return null;
  } catch (err) {
    console.warn(`[yahoo] failed for ${ticker}:`, err);
    return null;
  }
}
