"use client";

// price alerts stored in localStorage
// checked on every refresh cycle

import { useState, useEffect, useCallback } from "react";
import type { PriceAlert } from "@/types/alerts";
import type { PortfolioRow } from "@/types";

const LS_KEY = "equitylens_alerts";

function loadAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: PriceAlert[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(alerts));
  } catch {}
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    setAlerts(loadAlerts());
  }, []);

  useEffect(() => {
    if (alerts.length > 0 || loadAlerts().length > 0) {
      saveAlerts(alerts);
    }
  }, [alerts]);

  const addAlert = useCallback((alert: Omit<PriceAlert, "id" | "triggered" | "createdAt">) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      triggered: false,
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [...prev, newAlert]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // check alerts against current portfolio data
  // returns newly triggered alerts so we can show toasts
  const checkAlerts = useCallback((rows: PortfolioRow[]): PriceAlert[] => {
    const triggered: PriceAlert[] = [];

    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.triggered) return alert;

        const row = rows.find((r) => r.exchangeCode === alert.ticker);
        if (!row || row.cmp == null) return alert;

        const shouldTrigger =
          (alert.condition === "above" && row.cmp >= alert.targetPrice) ||
          (alert.condition === "below" && row.cmp <= alert.targetPrice);

        if (shouldTrigger) {
          const updated = { ...alert, triggered: true };
          triggered.push(updated);
          return updated;
        }
        return alert;
      })
    );

    return triggered;
  }, []);

  const clearTriggered = useCallback(() => {
    setAlerts((prev) => prev.filter((a) => !a.triggered));
  }, []);

  return { alerts, addAlert, removeAlert, checkAlerts, clearTriggered };
}
