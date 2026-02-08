# EquityLens API (Backend)

Express server for live portfolio data. Deploy on **Render** (or any Node host).

## Endpoints

- `GET /api/portfolio` — static portfolio JSON
- `GET /api/stock?ticker=RELIANCE.NS` — live data for one ticker
- `GET /api/portfolio/live` — default portfolio + live Yahoo/Google data
- `POST /api/portfolio/live` — body: `{ "stocks": [...] }` → live data
- `GET /health` — health check

## Local

```bash
cd backend
npm install
npm start
```

Runs on port 4000 (or `PORT` env).

## Deploy on Render

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect repo: **btwitsPratyush/EquityLens**
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free (or paid)
4. Deploy. Note the URL (e.g. `https://equitylens-api.onrender.com`).
5. In **Vercel** (frontend), add env: `NEXT_PUBLIC_API_URL=https://equitylens-api.onrender.com`

CORS allows `*.vercel.app` and localhost.
