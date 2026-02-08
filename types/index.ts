// portfolio item from our static JSON
export interface Stock {
  stockName: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: string; // like "RELIANCE.NS" or "RELIANCE.BO"
  sector: string;
}

// what we get back from yahoo
export interface YahooQuote {
  regularMarketPrice?: number;
  shortName?: string;
}

// scraped google finance data
export interface GoogleFinanceData {
  peRatio: number | null;
  latestEarnings: string | null;
}

// one row in the dashboard table (static + live data combined)
export interface PortfolioRow extends Stock {
  investment: number;
  portfolioPercent: number;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
}

// sector-wise totals for the grouping UI
export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number | null;
  stocks: PortfolioRow[];
}

// response shape for GET /api/stock
export interface StockApiResponse {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
  timestamp: string;
}

// response shape for GET /api/portfolio/live
export interface PortfolioLiveResponse {
  rows: PortfolioRow[];
  sectorSummaries: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number | null;
  lastUpdated: string;
  partialFailure?: boolean;
}
