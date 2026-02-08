"use client";

// configurable auto-refresh with toggle and interval selection

import { useState, useEffect, useCallback, useRef } from "react";

export type RefreshInterval = 5 | 15 | 30 | 60;

export function useAutoRefresh(onRefresh: () => Promise<void>) {
  const [enabled, setEnabled] = useState(true);
  const [interval, setIntervalVal] = useState<RefreshInterval>(15);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  // setup / teardown interval
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (enabled) {
      timerRef.current = setInterval(doRefresh, interval * 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, interval, doRefresh]);

  const manualRefresh = useCallback(async () => {
    await doRefresh();
  }, [doRefresh]);

  return {
    enabled,
    setEnabled,
    interval,
    setInterval: setIntervalVal,
    refreshing,
    manualRefresh,
  };
}
