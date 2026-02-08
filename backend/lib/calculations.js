function calcInvestment(price, qty) {
  return price * qty;
}

function calcPortfolioPercent(investment, total) {
  if (total <= 0) return 0;
  return (investment / total) * 100;
}

function calcPresentValue(cmp, qty) {
  if (cmp == null) return null;
  return cmp * qty;
}

function calcGainLoss(presentVal, investment) {
  if (presentVal == null) return null;
  return presentVal - investment;
}

function calcGainLossPercent(gl, investment) {
  if (gl == null || investment <= 0) return null;
  return (gl / investment) * 100;
}

function buildPortfolioRow(stock, totalInvestment, cmp, peRatio, latestEarnings) {
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

function groupBySector(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.sector)) map.set(r.sector, []);
    map.get(r.sector).push(r);
  }
  const result = [];
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

module.exports = { buildPortfolioRow, groupBySector };
