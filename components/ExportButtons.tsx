"use client";

import type { PortfolioRow } from "@/types";
import { toCSV, toJSON, downloadFile, exportPDF } from "@/lib/exportUtils";

interface Props {
  rows: PortfolioRow[];
  totals: { investment: number; presentValue: number; gainLoss: number };
}

export default function ExportButtons({ rows, totals }: Props) {
  function handleCSV() {
    downloadFile(toCSV(rows), "equitylens-portfolio.csv", "text/csv");
  }

  function handleJSON() {
    downloadFile(toJSON(rows), "equitylens-portfolio.json", "application/json");
  }

  async function handlePDF() {
    await exportPDF(rows, totals);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 mr-1">Export:</span>
      <button onClick={handleCSV} className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
        CSV
      </button>
      <button onClick={handleJSON} className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
        JSON
      </button>
      <button onClick={handlePDF} className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
        PDF
      </button>
    </div>
  );
}
