// GET /api/portfolio/live — enriches portfolio with live data
// also accepts POST with custom stocks array (for CRUD portfolio)
import { NextRequest, NextResponse } from "next/server";
import defaultPortfolio from "@/data/portfolio.json";
import type { Stock } from "@/types";
import { batchGetTickerData } from "@/lib/finance/liveData";
import { buildPortfolioRow, groupBySector } from "@/lib/calculations";

async function buildResponse(stocks: Stock[]) {
  const totalInvestment = stocks.reduce(
    (sum, s) => sum + s.purchasePrice * s.quantity,
    0
  );

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

// GET uses default portfolio.json
export async function GET() {
  const data = await buildResponse(defaultPortfolio as Stock[]);
  return NextResponse.json(data);
}

// POST accepts custom stocks array from frontend (for CRUD portfolio)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stocks: Stock[] = body.stocks ?? body;
    if (!Array.isArray(stocks) || stocks.length === 0) {
      return NextResponse.json({ error: "stocks array required" }, { status: 400 });
    }
    const data = await buildResponse(stocks);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }
}
