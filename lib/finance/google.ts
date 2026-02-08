// fetch P/E ratio and latest earnings from google finance
// google also has no public api, so we scrape the quote page using cheerio
// if the page structure changes, the selectors below might need updating

import * as cheerio from "cheerio";
import type { GoogleFinanceData } from "@/types";

const BASE_URL = "https://www.google.com/finance/quote";

// convert yahoo-style ticker to google-style
// RELIANCE.NS -> NSE:RELIANCE, RELIANCE.BO -> BSE:RELIANCE
function toGoogleTicker(ticker: string): string {
  const clean = ticker.replace(".NS", "").replace(".BO", "");
  const exchange = ticker.includes(".BO") ? "BSE" : "NSE";
  return `${exchange}:${clean}`;
}

export async function fetchGoogleData(ticker: string): Promise<GoogleFinanceData> {
  const fallback: GoogleFinanceData = { peRatio: null, latestEarnings: null };

  try {
    const gTicker = toGoogleTicker(ticker);
    const url = `${BASE_URL}/${gTicker}`;

    const res = await fetch(url, {
      headers: {
        // pretend to be a browser so google doesn't block us
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0",
      },
    });

    if (!res.ok) return fallback;

    const html = await res.text();
    const $ = cheerio.load(html);

    // try to find P/E ratio - google puts it in a data attribute
    // NOTE: these selectors might break if google changes their page
    $('[data-item="pe"]').each((_, el) => {
      const raw = $(el).text().replace(/[^0-9.]/g, "");
      const num = parseFloat(raw);
      if (!isNaN(num)) fallback.peRatio = num;
    });

    // latest earnings
    const earningsEl = $('[data-item="earnings"]').first();
    if (earningsEl.length) {
      const txt = earningsEl.text().trim();
      if (txt) fallback.latestEarnings = txt;
    }

    return fallback;
  } catch (err) {
    console.warn(`[google] scrape failed for ${ticker}:`, err);
    return fallback;
  }
}
