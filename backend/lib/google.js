const cheerio = require("cheerio");
const BASE_URL = "https://www.google.com/finance/quote";

function toGoogleTicker(ticker) {
  const clean = ticker.replace(".NS", "").replace(".BO", "");
  const exchange = ticker.includes(".BO") ? "BSE" : "NSE";
  return `${exchange}:${clean}`;
}

async function fetchGoogleData(ticker) {
  const fallback = { peRatio: null, latestEarnings: null };
  try {
    const gTicker = toGoogleTicker(ticker);
    const url = `${BASE_URL}/${gTicker}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0" },
    });
    if (!res.ok) return fallback;
    const html = await res.text();
    const $ = cheerio.load(html);
    $('[data-item="pe"]').each((_, el) => {
      const raw = $(el).text().replace(/[^0-9.]/g, "");
      const num = parseFloat(raw);
      if (!isNaN(num)) fallback.peRatio = num;
    });
    const earningsEl = $('[data-item="earnings"]').first();
    if (earningsEl.length) {
      const txt = earningsEl.text().trim();
      if (txt) fallback.latestEarnings = txt;
    }
    return fallback;
  } catch (err) {
    console.warn(`[google] scrape failed for ${ticker}:`, err.message);
    return fallback;
  }
}

module.exports = { fetchGoogleData };
