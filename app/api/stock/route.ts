// GET /api/stock?ticker=RELIANCE.NS
// returns live data for a single ticker (useful for testing/debugging)
import { NextRequest, NextResponse } from "next/server";
import { getTickerData } from "@/lib/finance/liveData";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "ticker param is required" }, { status: 400 });
  }

  try {
    const data = await getTickerData(ticker.trim());
    return NextResponse.json(data);
  } catch {
    // return a safe fallback instead of 500
    return NextResponse.json({
      cmp: null,
      peRatio: null,
      latestEarnings: null,
      timestamp: new Date().toISOString(),
    });
  }
}
