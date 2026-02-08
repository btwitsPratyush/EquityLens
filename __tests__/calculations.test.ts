import {
  calcInvestment,
  calcPortfolioPercent,
  calcPresentValue,
  calcGainLoss,
  calcGainLossPercent,
  groupBySector,
  buildPortfolioRow,
} from "@/lib/calculations";

describe("calcInvestment", () => {
  it("multiplies price by quantity", () => {
    expect(calcInvestment(100, 10)).toBe(1000);
    expect(calcInvestment(2450.5, 10)).toBe(24505);
  });

  it("handles zero", () => {
    expect(calcInvestment(0, 10)).toBe(0);
    expect(calcInvestment(100, 0)).toBe(0);
  });
});

describe("calcPortfolioPercent", () => {
  it("calculates correct percentage", () => {
    expect(calcPortfolioPercent(10000, 100000)).toBe(10);
    expect(calcPortfolioPercent(50000, 100000)).toBe(50);
  });

  it("returns 0 when total is 0", () => {
    expect(calcPortfolioPercent(100, 0)).toBe(0);
  });
});

describe("calcPresentValue", () => {
  it("returns cmp * qty when cmp is available", () => {
    expect(calcPresentValue(2500, 10)).toBe(25000);
  });

  it("returns null when cmp is null", () => {
    expect(calcPresentValue(null, 10)).toBeNull();
  });
});

describe("calcGainLoss", () => {
  it("calculates profit correctly", () => {
    expect(calcGainLoss(25000, 20000)).toBe(5000);
  });

  it("calculates loss correctly", () => {
    expect(calcGainLoss(15000, 20000)).toBe(-5000);
  });

  it("returns null when present value is null", () => {
    expect(calcGainLoss(null, 20000)).toBeNull();
  });
});

describe("calcGainLossPercent", () => {
  it("returns correct percentage", () => {
    expect(calcGainLossPercent(5000, 20000)).toBe(25);
  });

  it("handles negative gain", () => {
    expect(calcGainLossPercent(-5000, 20000)).toBe(-25);
  });

  it("returns null for null gain", () => {
    expect(calcGainLossPercent(null, 20000)).toBeNull();
  });
});

describe("buildPortfolioRow", () => {
  it("merges static and live data correctly", () => {
    const stock = {
      stockName: "Test",
      purchasePrice: 100,
      quantity: 10,
      exchangeCode: "TEST.NS",
      sector: "Tech",
    };
    const row = buildPortfolioRow(stock, 10000, 120, 25.5, "Q4 2025");

    expect(row.investment).toBe(1000);
    expect(row.cmp).toBe(120);
    expect(row.presentValue).toBe(1200);
    expect(row.gainLoss).toBe(200);
    expect(row.peRatio).toBe(25.5);
    expect(row.latestEarnings).toBe("Q4 2025");
  });
});

describe("groupBySector", () => {
  it("groups rows by sector with correct totals", () => {
    const rows = [
      buildPortfolioRow(
        { stockName: "A", purchasePrice: 100, quantity: 10, exchangeCode: "A.NS", sector: "Tech" },
        3000, 120, null, null
      ),
      buildPortfolioRow(
        { stockName: "B", purchasePrice: 200, quantity: 5, exchangeCode: "B.NS", sector: "Tech" },
        3000, 220, null, null
      ),
    ];

    const sectors = groupBySector(rows);
    expect(sectors).toHaveLength(1);
    expect(sectors[0].sector).toBe("Tech");
    expect(sectors[0].totalInvestment).toBe(2000);
    expect(sectors[0].stocks).toHaveLength(2);
  });
});
