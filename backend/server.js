const express = require("express");
const cors = require("cors");
const path = require("path");
const { getTickerData, batchGetTickerData } = require("./lib/liveData");
const { buildPortfolioRow, groupBySector } = require("./lib/calculations");

const app = express();
const PORT = process.env.PORT || 4000;

const defaultPortfolio = require(path.join(__dirname, "data", "portfolio.json"));

// Allow Vercel frontend (any *.vercel.app) + localhost
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (/\.vercel\.app$/.test(origin) || /localhost|127\.0\.0\.1/.test(origin)) return cb(null, true);
      cb(null, true); // allow others for flexibility (e.g. custom domain)
    },
    credentials: true,
  })
);
app.use(express.json());

async function buildLiveResponse(stocks) {
  const totalInvestment = stocks.reduce((sum, s) => sum + s.purchasePrice * s.quantity, 0);
  const tickers = stocks.map((s) => s.exchangeCode);
  const liveMap = await batchGetTickerData(tickers);
  let hasFailures = false;
  const rows = stocks.map((stock) => {
    const live = liveMap.get(stock.exchangeCode);
    const cmp = live?.cmp ?? null;
    const pe = live?.peRatio ?? null;
    const earnings = live?.latestEarnings ?? null;
    if (cmp === null) hasFailures = true;
    return buildPortfolioRow(stock, totalInvestment, cmp, pe, earnings);
  });
  const sectors = groupBySector(rows);
  const totalPV = rows.reduce((s, r) => s + (r.presentValue ?? 0), 0);
  const totalGL = totalPV - totalInvestment;
  return {
    rows,
    sectorSummaries: sectors,
    totalInvestment,
    totalPresentValue: totalPV,
    totalGainLoss: totalGL,
    totalGainLossPercent: totalInvestment > 0 ? (totalGL / totalInvestment) * 100 : null,
    lastUpdated: new Date().toISOString(),
    partialFailure: hasFailures,
  };
}

// GET /api/portfolio — static
app.get("/api/portfolio", (req, res) => {
  res.json(defaultPortfolio);
});

// GET /api/stock?ticker=RELIANCE.NS
app.get("/api/stock", async (req, res) => {
  const ticker = req.query.ticker;
  if (!ticker) return res.status(400).json({ error: "ticker param required" });
  try {
    const data = await getTickerData(ticker.trim());
    res.json(data);
  } catch {
    res.json({ cmp: null, peRatio: null, latestEarnings: null, timestamp: new Date().toISOString() });
  }
});

// GET /api/portfolio/live — default portfolio + live
app.get("/api/portfolio/live", async (req, res) => {
  try {
    const data = await buildLiveResponse(defaultPortfolio);
    res.json(data);
  } catch (err) {
    console.error("[live GET]", err);
    res.status(500).json({ error: "Failed to fetch live data" });
  }
});

// POST /api/portfolio/live — custom stocks + live
app.post("/api/portfolio/live", async (req, res) => {
  try {
    const stocks = req.body?.stocks ?? req.body;
    if (!Array.isArray(stocks) || stocks.length === 0) {
      return res.status(400).json({ error: "stocks array required" });
    }
    const data = await buildLiveResponse(stocks);
    res.json(data);
  } catch (err) {
    console.error("[live POST]", err);
    res.status(500).json({ error: "Failed to fetch live data" });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`EquityLens API running on port ${PORT}`);
});
