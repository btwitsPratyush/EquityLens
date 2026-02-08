"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import type { Stock } from "@/types";

interface Props {
  onImport: (stocks: Stock[]) => void;
}

// sample csv content for download
const SAMPLE_CSV = `stockName,purchasePrice,quantity,exchangeCode,sector
Reliance Industries,2450.50,10,RELIANCE.NS,Energy
TCS,3650,5,TCS.NS,Technology
HDFC Bank,1680,15,HDFCBANK.NS,Financials`;

export default function CsvUpload({ onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_portfolio.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(result) {
        const errs: string[] = [];
        const stocks: Stock[] = [];

        result.data.forEach((row: unknown, i: number) => {
          const r = row as Record<string, string>;
          const lineNum = i + 2; // +1 for 0-index, +1 for header

          // validate required fields
          if (!r.stockName?.trim()) {
            errs.push(`Row ${lineNum}: missing stockName`);
            return;
          }
          if (!r.exchangeCode?.trim()) {
            errs.push(`Row ${lineNum}: missing exchangeCode`);
            return;
          }

          const price = parseFloat(r.purchasePrice);
          const qty = parseInt(r.quantity, 10);

          if (isNaN(price) || price <= 0) {
            errs.push(`Row ${lineNum}: invalid purchasePrice "${r.purchasePrice}"`);
            return;
          }
          if (isNaN(qty) || qty <= 0) {
            errs.push(`Row ${lineNum}: invalid quantity "${r.quantity}"`);
            return;
          }

          stocks.push({
            stockName: r.stockName.trim(),
            purchasePrice: price,
            quantity: qty,
            exchangeCode: r.exchangeCode.trim(),
            sector: r.sector?.trim() || "Other",
          });
        });

        setErrors(errs);

        if (stocks.length > 0) {
          onImport(stocks);
        }
      },
      error(err) {
        setErrors([`CSV parse error: ${err.message}`]);
      },
    });

    // reset input so same file can be uploaded again
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <label className="cursor-pointer px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-sm">
          Upload CSV
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />
        </label>
        <button
          onClick={downloadSample}
          className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Download Sample CSV
        </button>
      </div>

      {errors.length > 0 && (
        <div className="text-xs text-red-600 dark:text-red-400 space-y-0.5 mt-1">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}
