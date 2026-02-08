import type { PortfolioRow } from "@/types";

// computed insight tags based on financial metrics
// no AI - just simple rules that make sense financially

export type TagType = "overvalued" | "undervalued" | "high-profit" | "high-loss" | "stable";

export interface SmartTag {
  type: TagType;
  label: string;
  color: string; // tailwind bg class
}

export function getSmartTags(row: PortfolioRow): SmartTag[] {
  const tags: SmartTag[] = [];

  // P/E based tags
  if (row.peRatio != null) {
    if (row.peRatio > 40) {
      tags.push({ type: "overvalued", label: "Overvalued", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" });
    } else if (row.peRatio < 15) {
      tags.push({ type: "undervalued", label: "Undervalued", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" });
    }
  }

  // gain/loss based tags
  if (row.gainLossPercent != null) {
    const glp = row.gainLossPercent;
    if (glp > 20) {
      tags.push({ type: "high-profit", label: "High Profit", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" });
    } else if (glp < -15) {
      tags.push({ type: "high-loss", label: "High Loss", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" });
    } else if (Math.abs(glp) < 5) {
      tags.push({ type: "stable", label: "Stable", color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" });
    }
  }

  return tags;
}
