"use client";

import { useState } from "react";
import type { SectorSummary, PortfolioRow } from "@/types";
import PortfolioTable from "./PortfolioTable";
import { inr, pct } from "@/lib/format";

interface Props {
  summary: SectorSummary;
  onRowClick?: (row: PortfolioRow) => void;
  onEdit?: (row: PortfolioRow) => void;
  onDelete?: (row: PortfolioRow) => void;
}

export default function SectorSection({ summary, onRowClick, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(true);
  const profit = summary.totalGainLoss >= 0;

  return (
    <div className="mb-8 card overflow-hidden border-none shadow-xl bg-white/20 dark:bg-slate-900/30 backdrop-blur-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all text-left group"
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
            {summary.sector.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
              {summary.sector}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {summary.stocks.length} Stock{summary.stocks.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Value</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{inr(summary.totalPresentValue)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Returns</span>
            <span className={`text-sm font-black ${profit ? "text-emerald-500" : "text-rose-500"}`}>
              {profit ? "+" : ""}{inr(summary.totalGainLoss)}
            </span>
          </div>
          <div className="flex flex-col items-end min-w-[60px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ROI</span>
            <span className={`text-sm font-black ${profit ? "text-emerald-500" : "text-rose-500"}`}>
              {profit ? "▲" : "▼"} {pct(summary.totalGainLossPercent)}
            </span>
          </div>
          <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 transition-transform ${open ? "" : "-rotate-90"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </button>

      {open && (
        <div className="p-4 bg-white/10 dark:bg-slate-950/20">
          <PortfolioTable
            rows={summary.stocks}
            onRowClick={onRowClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}
