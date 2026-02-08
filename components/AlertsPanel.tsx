"use client";

import { useState } from "react";
import type { PriceAlert } from "@/types/alerts";
import type { PortfolioRow } from "@/types";

interface Props {
  alerts: PriceAlert[];
  rows: PortfolioRow[];
  onAdd: (alert: Omit<PriceAlert, "id" | "triggered" | "createdAt">) => void;
  onRemove: (id: string) => void;
  onClearTriggered: () => void;
}

export default function AlertsPanel({ alerts, rows, onAdd, onRemove, onClearTriggered }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [price, setPrice] = useState("");

  const triggeredCount = alerts.filter((a) => a.triggered).length;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker || !price) return;
    const stock = rows.find((r) => r.exchangeCode === ticker);
    onAdd({
      ticker,
      stockName: stock?.stockName ?? ticker,
      condition,
      targetPrice: parseFloat(price),
    });
    setPrice("");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        Alerts
        {triggeredCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
            {triggeredCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm">Price Alerts</h4>
            {triggeredCount > 0 && (
              <button onClick={onClearTriggered} className="text-xs text-red-500 hover:underline">
                Clear triggered
              </button>
            )}
          </div>

          {/* add new alert */}
          <form onSubmit={handleAdd} className="flex gap-2 mb-3">
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              <option value="">Select stock</option>
              {rows.map((r) => (
                <option key={r.exchangeCode} value={r.exchangeCode}>
                  {r.stockName}
                </option>
              ))}
            </select>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as "above" | "below")}
              className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="w-20 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            />
            <button type="submit" className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-500">
              Add
            </button>
          </form>

          {/* alerts list */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {alerts.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">No alerts set</p>
            )}
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded text-xs ${
                  a.triggered
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-slate-50 dark:bg-slate-700/50"
                }`}
              >
                <span>
                  <span className="font-medium">{a.stockName}</span>
                  {" "}
                  {a.condition === "above" ? ">" : "<"} ₹{a.targetPrice}
                  {a.triggered && <span className="ml-1 text-green-600"> TRIGGERED</span>}
                </span>
                <button onClick={() => onRemove(a.id)} className="text-red-400 hover:text-red-600 ml-2">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
