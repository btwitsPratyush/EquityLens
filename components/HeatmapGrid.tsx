"use client";

import { PortfolioRow } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Professional muted palette — no neon red/green
function getHeatColor(glPct: number | null): string {
  if (glPct == null) return "bg-slate-200/60 dark:bg-slate-700/60";
  // Greens — muted teal/slate tones
  if (glPct > 30) return "bg-teal-700 dark:bg-teal-600";
  if (glPct > 15) return "bg-teal-600/90 dark:bg-teal-600/80";
  if (glPct > 5)  return "bg-teal-500/80 dark:bg-teal-500/70";
  if (glPct > 0)  return "bg-teal-400/50 dark:bg-teal-500/40";
  // Reds — muted warm slate tones
  if (glPct > -5)  return "bg-orange-400/45 dark:bg-orange-500/35";
  if (glPct > -15) return "bg-orange-500/70 dark:bg-orange-500/60";
  if (glPct > -30) return "bg-orange-600/80 dark:bg-orange-600/70";
  return "bg-orange-700/90 dark:bg-orange-700/80";
}

function getTextColor(glPct: number | null): string {
  if (glPct == null) return "text-muted-foreground";
  if (glPct > 15 || glPct < -15) return "text-white font-bold";
  if (glPct > 5 || glPct < -5) return "text-white/90 font-semibold";
  return "text-foreground font-semibold";
}

export default function HeatmapGrid({ rows }: { rows: PortfolioRow[] }) {
  if (rows.length === 0) return null;

  // Sort by absolute change to show most significant movers first (or just standard verify)
  const sortedRows = [...rows].sort((a, b) => Math.abs(b.gainLossPercent || 0) - Math.abs(a.gainLossPercent || 0));

  return (
    <div className="h-full p-6 flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
        Performance Heatmap
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 content-start flex-1">
        {sortedRows.map((r) => (
          <motion.div
            key={r.exchangeCode}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            className={cn(
              "aspect-square rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors border border-transparent",
              getHeatColor(r.gainLossPercent),
              getTextColor(r.gainLossPercent)
            )}
            title={`${r.stockName}: ${r.gainLossPercent?.toFixed(2)}%`}
          >
            <p className="text-[10px] font-bold uppercase tracking-tighter truncate w-full opacity-90">
              {r.stockName.substring(0, 10)}
            </p>
            <p className="text-xs font-black mt-0.5">
              {r.gainLossPercent != null ? `${r.gainLossPercent > 0 ? "+" : ""}${Math.round(r.gainLossPercent)}%` : "-"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
