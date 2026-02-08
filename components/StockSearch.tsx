"use client";

import { useState, useRef, useEffect } from "react";
import type { Stock } from "@/types";
import tickerList from "@/data/tickers.json";

interface TickerItem {
  symbol: string;
  name: string;
  sector: string;
}

interface Props {
  onAdd: (stock: Stock) => void;
}

export default function StockSearch({ onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // filter tickers as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = (tickerList as TickerItem[]).filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q)
    ).slice(0, 8); // limit to 8 suggestions
    setResults(filtered);
  }, [query]);

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectTicker(item: TickerItem) {
    onAdd({
      stockName: item.name,
      purchasePrice: 0, // user needs to set this
      quantity: 0,
      exchangeCode: item.symbol,
      sector: item.sector,
    });
    setQuery("");
    setShowDropdown(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Search stocks... (e.g. Reliance)"
        className="w-64 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-foreground placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
      />

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.symbol}
              onClick={() => selectTicker(item)}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-slate-400 ml-2 text-xs">{item.symbol}</span>
              </div>
              <span className="text-xs text-slate-500">{item.sector}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
