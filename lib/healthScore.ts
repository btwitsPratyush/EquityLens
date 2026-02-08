import type { PortfolioRow, SectorSummary } from "@/types";

// portfolio health score (0-100)
// based on: diversification, total gain%, avg P/E, concentration risk

export interface HealthResult {
  score: number;
  grade: string; // A, B, C, D, F
  breakdown: {
    diversification: number;
    performance: number;
    valuation: number;
    concentration: number;
  };
}

export function computeHealthScore(
  rows: PortfolioRow[],
  sectors: SectorSummary[],
  totalGainLossPercent: number | null
): HealthResult {
  if (rows.length === 0) {
    return { score: 0, grade: "F", breakdown: { diversification: 0, performance: 0, valuation: 0, concentration: 0 } };
  }

  // 1. Diversification (25 pts) - more sectors = better
  const sectorCount = sectors.length;
  // 5+ sectors = full marks, 1 sector = low
  const divScore = Math.min(25, (sectorCount / 5) * 25);

  // 2. Performance (25 pts) - based on total gain %
  let perfScore = 12.5; // neutral
  if (totalGainLossPercent != null) {
    if (totalGainLossPercent >= 20) perfScore = 25;
    else if (totalGainLossPercent >= 10) perfScore = 20;
    else if (totalGainLossPercent >= 0) perfScore = 15;
    else if (totalGainLossPercent >= -10) perfScore = 8;
    else perfScore = 3;
  }

  // 3. Valuation (25 pts) - based on avg P/E of portfolio
  const peValues = rows.filter((r) => r.peRatio != null).map((r) => r.peRatio!);
  let valScore = 12.5;
  if (peValues.length > 0) {
    const avgPE = peValues.reduce((s, v) => s + v, 0) / peValues.length;
    if (avgPE >= 15 && avgPE <= 25) valScore = 25; // sweet spot
    else if (avgPE < 15) valScore = 20; // cheap but maybe risky
    else if (avgPE <= 35) valScore = 15;
    else valScore = 8; // expensive
  }

  // 4. Concentration (25 pts) - largest holding shouldn't dominate
  const totalInv = rows.reduce((s, r) => s + r.investment, 0);
  const maxHoldingPct = totalInv > 0
    ? Math.max(...rows.map((r) => (r.investment / totalInv) * 100))
    : 100;
  let concScore = 25;
  if (maxHoldingPct > 50) concScore = 5;
  else if (maxHoldingPct > 35) concScore = 12;
  else if (maxHoldingPct > 25) concScore = 18;
  // else full 25

  const total = Math.round(divScore + perfScore + valScore + concScore);
  const grade = total >= 80 ? "A" : total >= 65 ? "B" : total >= 50 ? "C" : total >= 35 ? "D" : "F";

  return {
    score: total,
    grade,
    breakdown: {
      diversification: Math.round(divScore),
      performance: Math.round(perfScore),
      valuation: Math.round(valScore),
      concentration: Math.round(concScore),
    },
  };
}
