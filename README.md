# EquityLens

> Real-time stock portfolio dashboard built with **Next.js**. Live CMP from Yahoo Finance, P/E & earnings from Google Finance, sector grouping, and portfolio analytics.

**Repo:** [github.com/btwitsPratyush/EquityLens](https://github.com/btwitsPratyush/EquityLens)

## Case Study Requirements (Octa Byte AI)

| Requirement | Status |
|-------------|--------|
| **Data:** Yahoo Finance (CMP) | ✅ Direct v8 chart API |
| **Data:** Google Finance (P/E, Latest Earnings) | ✅ Cheerio scraping |
| **Table columns:** Particulars, Purchase Price, Qty, Investment, Portfolio (%), NSE/BSE, CMP, Present Value, Gain/Loss, P/E Ratio, Latest Earnings | ✅ All 11 columns |
| **Dynamic updates:** CMP, Present Value, Gain/Loss every 15s | ✅ `useAutoRefresh` (configurable 5/15/30/60s) |
| **Visual:** Green for gains, Red for losses | ✅ Portfolio table & sector summary |
| **Sector grouping:** Total Investment, Total Present Value, Gain/Loss per sector | ✅ Collapsible sector rows with totals |
| **Tech:** Next.js, Node.js, Tailwind, TypeScript | ✅ |
| **Table:** react-table | ✅ @tanstack/react-table |
| **Charts:** recharts (optional) | ✅ Sector pie chart |
| **Caching / rate limits** | ✅ In-memory TTL cache, retry, stale fallback |
| **Error handling** | ✅ Partial failure banner, retry, N/A for failed rows |

## Features

**Core**
- Portfolio table with all required columns using @tanstack/react-table
- Sector grouping with collapsible sections and sector-level totals
- Summary cards (Total Investment, Present Value, Gain/Loss, Gain/Loss %)
- Live auto-refresh every 15 seconds with configurable intervals
- Green/red color coding for gains and losses

**Premium**
- CSV Upload — import portfolio from CSV with validation
- CRUD — add, edit, delete stocks with localStorage persistence
- Stock Search — autocomplete search from 30+ NSE tickers
- Price Alerts — set CMP above/below alerts, toast notifications when triggered
- Smart Tags — auto badges: Overvalued, Undervalued, High Profit, High Loss, Stable
- Portfolio Health Score — 0-100 score based on diversification, performance, valuation, concentration
- Sector Allocation Pie Chart (Recharts)
- Gain/Loss Heatmap Grid
- Stock Detail Drawer — Bloomberg-style side panel with charts and breakdown
- Refresh Controls — toggle auto-refresh, change interval, manual refresh
- Export — CSV, JSON, and PDF report download

**Backend**
- In-memory TTL cache (15s) with stale fallback
- Exponential backoff retry on fetch failures
- Batched parallel fetching with Promise.all
- Partial failure handling (graceful degradation)

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Table:** @tanstack/react-table
- **Charts:** Recharts (pie chart, bar charts)
- **Backend:** Next.js API routes
- **Data:** Yahoo v8 chart API (CMP), Cheerio (Google Finance P/E & earnings)
- **Extras:** papaparse (CSV), jsPDF (PDF), react-hot-toast (notifications)
- **Testing:** Jest + ts-jest
- **Linting:** ESLint + Prettier

## Getting Started

```bash
git clone https://github.com/btwitsPratyush/EquityLens.git
cd EquityLens
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing

```bash
npm test
```

Runs unit tests for calculations and health score logic.

## API Endpoints

- `GET /api/portfolio` — static portfolio data
- `GET /api/stock?ticker=RELIANCE.NS` — live data for one ticker
- `GET /api/portfolio/live` — full portfolio + live data (default stocks)
- `POST /api/portfolio/live` — same but with custom stocks array in body

## Project Structure

```
app/
  page.tsx                    # main dashboard
  layout.tsx
  api/
    portfolio/route.ts
    portfolio/live/route.ts   # GET + POST
    stock/route.ts
components/
  PortfolioTable.tsx          # react-table with smart tags + actions
  SummaryCards.tsx
  SectorSection.tsx
  SectorPieChart.tsx          # recharts pie chart
  HeatmapGrid.tsx             # gain/loss heatmap
  HealthScoreCard.tsx         # portfolio health 0-100
  SmartTagsBadge.tsx          # overvalued/undervalued badges
  StockDrawer.tsx             # bloomberg-style detail drawer
  StockModal.tsx              # add/edit stock modal
  StockSearch.tsx             # autocomplete search
  CsvUpload.tsx               # CSV import + download sample
  AlertsPanel.tsx             # price alerts panel
  RefreshControls.tsx         # auto-refresh toggle + interval
  ExportButtons.tsx           # CSV/JSON/PDF export
  WarningBanner.tsx
hooks/
  usePortfolio.ts             # CRUD + localStorage
  useAlerts.ts                # price alerts + localStorage
  useAutoRefresh.ts           # configurable auto-refresh
lib/
  calculations.ts
  cache.ts                    # TTL cache + stale fallback
  format.ts
  smartTags.ts                # computed insight tags
  healthScore.ts              # portfolio health 0-100
  exportUtils.ts              # CSV/JSON/PDF generation
  finance/
    yahoo.ts
    google.ts
    liveData.ts               # batched fetch + retry + cache
data/
  portfolio.json
  tickers.json                # 30+ NSE tickers for search
types/
  index.ts
  alerts.ts
__tests__/
  calculations.test.ts       # 14 unit tests
  healthScore.test.ts         # 2 unit tests
docs/
  challenges.md
```

## Deployment

Works on Vercel out of the box. No API keys needed.

## Deliverables

- **Source code:** This repo (full Next.js app).
- **README:** This file (setup, usage, requirements checklist).
- **Technical document:** [`docs/challenges.md`](docs/challenges.md) — key challenges and solutions (APIs, caching, retry, partial failure, real-time updates).

## Notes

- Yahoo/Google data uses unofficial methods and may break if they change their endpoints/HTML.
- See `docs/challenges.md` for the technical writeup required for evaluation.
