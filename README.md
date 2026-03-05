# EquityLens:-

Real-time stock portfolio dashboard built with **Next.js**. View holdings with live prices (Yahoo Finance), P/E & earnings (Google Finance), sector grouping, and portfolio analytics.

**[→ Repository](https://github.com/btwitsPratyush/EquityLens)**

---

## Features:

- **Portfolio table** — Particulars, Purchase Price, Qty, Investment, Portfolio %, NSE/BSE, CMP, Present Value, Gain/Loss, P/E Ratio, Latest Earnings. Collapsible sector grouping with sector-level totals (Total Investment, Present Value, Gain/Loss). Green/red for gains and losses.
- **Live data** — CMP from Yahoo Finance (v8 chart API), P/E and Latest Earnings from Google Finance (Cheerio). Auto-refresh every 15s (configurable 5/15/30/60s).
- **Summary cards** — Total Investment, Present Value, Gain/Loss, Gain/Loss %.
- **Extra** — CSV import, add/edit/delete stocks (localStorage), stock search, price alerts, portfolio health score, sector pie chart (Recharts), gain/loss heatmap, stock detail drawer, export (CSV/JSON/PDF).
- **Backend** — In-memory TTL cache, retry with backoff, partial failure handling. No API keys required.

## Tech Stack

| Layer   | Stack |
|--------|--------|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Table    | @tanstack/react-table |
| Charts   | Recharts |
| Data     | Yahoo v8 chart API (CMP), Cheerio (Google Finance) |
| Extras   | papaparse, jsPDF, react-hot-toast |

## Getting Started

```bash
git clone https://github.com/btwitsPratyush/EquityLens.git
cd EquityLens
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command      | Description        |
|-------------|--------------------|
| `npm run dev`  | Start dev server   |
| `npm run build`| Production build   |
| `npm run start`| Run production    |
| `npm test`     | Run unit tests     |
| `npm run lint` | Run ESLint         |

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio` | GET | Static portfolio (JSON) |
| `/api/stock?ticker=RELIANCE.NS` | GET | Live data for one ticker |
| `/api/portfolio/live` | GET / POST | Full portfolio + live data (POST accepts custom `stocks` in body) |

## Project Structure

```
app/          → pages, layout, API routes (used when running full Next.js locally)
backend/      → Express API for Render (Yahoo/Google live data)
components/   → UI (table, cards, charts, modals)
hooks/        → usePortfolio, useAlerts, useAutoRefresh
lib/          → calculations, cache, format, finance (yahoo, google, liveData)
data/         → portfolio.json, tickers.json
docs/         → challenges.md (technical notes)
```

## Deployment (Frontend on Vercel, Backend on Render)

### 1. Backend (Render)

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect **GitHub** → repo **btwitsPratyush/EquityLens**.
3. Set **Root Directory** to `backend`.
4. **Build command:** `npm install`  
   **Start command:** `npm start`
5. Deploy. Copy the service URL (e.g. `https://equitylens-api.onrender.com`).

See [`backend/README.md`](backend/README.md) for details.

### 2. Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import **EquityLens**.
2. In **Environment Variables** add:
   - **Name:** `NEXT_PUBLIC_API_URL`  
   - **Value:** your Render backend URL (e.g. `https://equitylens-api.onrender.com`) — no trailing slash.
3. Deploy. The app will call the Render API for live data.

### Local (full stack)

- **Option A:** Run Next.js only: `npm run dev` — uses built-in API routes at `/api/*`.
- **Option B:** Run backend + frontend: start `backend` on port 4000, then set `NEXT_PUBLIC_API_URL=http://localhost:4000` and run `npm run dev` in the repo root.

## Notes

Yahoo and Google data use unofficial endpoints; behaviour may change if they update their sites. Technical details and design choices are in [`docs/challenges.md`](docs/challenges.md).
