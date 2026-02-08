import { computeHealthScore } from "@/lib/healthScore";
import { buildPortfolioRow, groupBySector } from "@/lib/calculations";

describe("computeHealthScore", () => {
  it("returns 0 for empty portfolio", () => {
    const result = computeHealthScore([], [], null);
    expect(result.score).toBe(0);
    expect(result.grade).toBe("F");
  });

  it("returns a score between 0 and 100", () => {
    const rows = [
      buildPortfolioRow(
        { stockName: "A", purchasePrice: 100, quantity: 10, exchangeCode: "A.NS", sector: "Tech" },
        1000, 120, 20, null
      ),
      buildPortfolioRow(
        { stockName: "B", purchasePrice: 200, quantity: 5, exchangeCode: "B.NS", sector: "Finance" },
        1000, 210, 18, null
      ),
    ];
    const sectors = groupBySector(rows);
    const result = computeHealthScore(rows, sectors, 15);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(["A", "B", "C", "D", "F"]).toContain(result.grade);
  });
});
