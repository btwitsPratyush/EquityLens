"use client";

// bloomberg-style side drawer showing detailed stock info

import type { PortfolioRow } from "@/types";
import { getSmartTags } from "@/lib/smartTags";
import SmartTagsBadge from "./SmartTagsBadge";
import { inr, pct, num } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  stock: PortfolioRow | null;
  onClose: () => void;
}

export default function StockDrawer({ stock, onClose }: Props) {
  if (!stock) return null;

  const tags = getSmartTags(stock);
  const profit = (stock.gainLoss ?? 0) >= 0;

  const chartData = [
    { name: "Investment", value: stock.investment, color: "#6366f1" },
    { name: "Present Value", value: stock.presentValue ?? 0, color: profit ? "#10b981" : "#ef4444" },
  ];

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {stock.stockName}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">{stock.exchangeCode}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-xl"
            >
              ×
            </button>
          </div>

          {/* smart tags */}
          {tags.length > 0 && (
            <div className="mb-4">
              <SmartTagsBadge tags={tags} />
            </div>
          )}

          {/* key metrics grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard label="CMP" value={num(stock.cmp)} />
            <MetricCard label="P/E Ratio" value={num(stock.peRatio)} />
            <MetricCard label="Latest Earnings" value={stock.latestEarnings ?? "N/A"} />
            <MetricCard label="Sector" value={stock.sector} />
            <MetricCard label="Quantity" value={String(stock.quantity)} />
            <MetricCard label="Purchase Price" value={inr(stock.purchasePrice)} />
          </div>

          {/* investment vs present value chart */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Investment vs Present Value
            </h4>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} layout="vertical" barSize={24}>
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* gain/loss breakdown */}
          <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              Gain/Loss Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <Row label="Investment" value={inr(stock.investment)} />
              <Row label="Present Value" value={inr(stock.presentValue)} />
              <Row
                label="Gain/Loss"
                value={inr(stock.gainLoss)}
                color={profit ? "text-emerald-600" : "text-red-600"}
              />
              <Row
                label="Gain/Loss %"
                value={pct(stock.gainLossPercent)}
                color={profit ? "text-emerald-600" : "text-red-600"}
              />
              <Row label="Portfolio Weight" value={`${stock.portfolioPercent.toFixed(2)}%`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium ${color ?? ""}`}>{value}</span>
    </div>
  );
}
