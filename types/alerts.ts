// price alert types
export interface PriceAlert {
  id: string;
  ticker: string;
  stockName: string;
  condition: "above" | "below";
  targetPrice: number;
  triggered: boolean;
  createdAt: string;
}
