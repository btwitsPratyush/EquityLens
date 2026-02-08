import type { PortfolioRow } from "@/types";

// export portfolio as CSV string
export function toCSV(rows: PortfolioRow[]): string {
  const headers = [
    "Stock Name", "Purchase Price", "Qty", "Investment", "Portfolio %",
    "Exchange", "CMP", "Present Value", "Gain/Loss", "Gain/Loss %",
    "P/E Ratio", "Latest Earnings"
  ];

  const lines = rows.map((r) => [
    r.stockName,
    r.purchasePrice,
    r.quantity,
    r.investment.toFixed(2),
    r.portfolioPercent.toFixed(2),
    r.exchangeCode,
    r.cmp ?? "N/A",
    r.presentValue?.toFixed(2) ?? "N/A",
    r.gainLoss?.toFixed(2) ?? "N/A",
    r.gainLossPercent?.toFixed(2) ?? "N/A",
    r.peRatio ?? "N/A",
    r.latestEarnings ?? "N/A",
  ].join(","));

  return [headers.join(","), ...lines].join("\n");
}

// export as JSON string
export function toJSON(rows: PortfolioRow[]): string {
  return JSON.stringify(rows, null, 2);
}

// trigger file download in browser
export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// generate PDF report (basic)
export async function exportPDF(rows: PortfolioRow[], totals: { investment: number; presentValue: number; gainLoss: number }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(18);
  doc.text("EquityLens Portfolio Report", 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 28);

  // summary
  doc.setFontSize(12);
  doc.text(`Total Investment: INR ${totals.investment.toLocaleString("en-IN")}`, 14, 40);
  doc.text(`Present Value: INR ${totals.presentValue.toLocaleString("en-IN")}`, 14, 48);
  doc.text(`Gain/Loss: INR ${totals.gainLoss.toLocaleString("en-IN")}`, 14, 56);

  // table header
  let y = 70;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const cols = ["Stock", "Qty", "Investment", "CMP", "Present Value", "Gain/Loss", "P/E"];
  cols.forEach((col, i) => {
    doc.text(col, 14 + i * 40, y);
  });

  doc.setFont("helvetica", "normal");
  y += 8;

  for (const r of rows) {
    if (y > 190) {
      doc.addPage();
      y = 20;
    }
    const vals = [
      r.stockName.substring(0, 15),
      String(r.quantity),
      r.investment.toFixed(0),
      r.cmp?.toFixed(0) ?? "N/A",
      r.presentValue?.toFixed(0) ?? "N/A",
      r.gainLoss?.toFixed(0) ?? "N/A",
      r.peRatio?.toFixed(1) ?? "N/A",
    ];
    vals.forEach((v, i) => {
      doc.text(v, 14 + i * 40, y);
    });
    y += 6;
  }

  doc.save("equitylens-report.pdf");
}
