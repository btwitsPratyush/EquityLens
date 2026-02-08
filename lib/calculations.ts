import type { Stock, PortfolioRow, SectorSummary } from "@/types";

// ---- basic portfolio math ----

export function calcInvestment(price: number, qty: number) {
  return price * qty;
}

export function calcPortfolioPercent(investment: number, total: number) {
  if (total <= 0) return 0;
  return (investment / total) * 100;
}

export function calcPresentValue(cmp: number | null, qty: number) {
  if (cmp == null) return null;
  return cmp * qty;
}

export function calcGainLoss(presentVal: number | null, investment: number) {
  if (presentVal == null) return null;
  return presentVal - investment;
}

export function calcGainLossPercent(gl: number | null, investment: number) {
  if (gl == null || investment <= 0) return null;
  return (gl / investment) * 100;
}

// build a full table row from static stock data + live values
export function buildPortfolioRow(
  stock: Stock,
  totalInvestment: number,
  cmp: number | null,
  peRatio: number | null,
  latestEarnings: string | null
): PortfolioRow {
  const investment = calcInvestment(stock.purchasePrice, stock.quantity);
  const pct = calcPortfolioPercent(investment, totalInvestment);
  const pv = calcPresentValue(cmp, stock.quantity);
  const gl = calcGainLoss(pv, investment);
  const glPct = calcGainLossPercent(gl, investment);

  return {
    ...stock,
    investment,
    portfolioPercent: pct,
    cmp,
    presentValue: pv,
    gainLoss: gl,
    gainLossPercent: glPct,
    peRatio,
    latestEarnings,
  };
}

// group rows by sector, compute totals per group
export function groupBySector(rows: PortfolioRow[]): SectorSummary[] {
  const map = new Map<string, PortfolioRow[]>();

  for (const r of rows) {
    if (!map.has(r.sector)) map.set(r.sector, []);
    map.get(r.sector)!.push(r);
  }

  const result: SectorSummary[] = [];

  map.forEach((stocks, sector) => {
    const totalInv = stocks.reduce((sum, s) => sum + s.investment, 0);
    const totalPV = stocks.reduce((sum, s) => sum + (s.presentValue ?? 0), 0);
    const totalGL = totalPV - totalInv;

    result.push({
      sector,
      totalInvestment: totalInv,
      totalPresentValue: totalPV,
      totalGainLoss: totalGL,
      totalGainLossPercent: totalInv > 0 ? (totalGL / totalInv) * 100 : null,
      stocks,
    });
  });

  return result;
}
