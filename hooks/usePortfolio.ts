"use client";

// manages portfolio state with localStorage persistence
// supports add, edit, delete operations

import { useState, useEffect, useCallback } from "react";
import type { Stock } from "@/types";

const LS_KEY = "equitylens_portfolio";

// default portfolio loaded from json on first use
import defaultPortfolio from "@/data/portfolio.json";

function loadFromStorage(): Stock[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted data, ignore
  }
  return null;
}

function saveToStorage(stocks: Stock[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(stocks));
  } catch {
    // storage full or blocked, silently fail
  }
}

export function usePortfolio() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loaded, setLoaded] = useState(false);

  // load from localStorage on mount, fallback to default json
  useEffect(() => {
    const saved = loadFromStorage();
    setStocks(saved ?? (defaultPortfolio as Stock[]));
    setLoaded(true);
  }, []);

  // persist to localStorage on every change
  useEffect(() => {
    if (loaded) {
      saveToStorage(stocks);
    }
  }, [stocks, loaded]);

  const addStock = useCallback((stock: Stock) => {
    setStocks((prev) => [...prev, stock]);
  }, []);

  const updateStock = useCallback((index: number, updated: Partial<Stock>) => {
    setStocks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updated } : s))
    );
  }, []);

  const removeStock = useCallback((index: number) => {
    setStocks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const replaceAll = useCallback((newStocks: Stock[]) => {
    setStocks(newStocks);
  }, []);

  const resetToDefault = useCallback(() => {
    setStocks(defaultPortfolio as Stock[]);
  }, []);

  return { stocks, loaded, addStock, updateStock, removeStock, replaceAll, resetToDefault };
}
