"use client";

import type { RefreshInterval } from "@/hooks/useAutoRefresh";

interface Props {
  enabled: boolean;
  onToggle: (val: boolean) => void;
  interval: RefreshInterval;
  onIntervalChange: (val: RefreshInterval) => void;
  refreshing: boolean;
  onManualRefresh: () => void;
  lastUpdated: string;
}

const INTERVALS: RefreshInterval[] = [5, 15, 30, 60];

export default function RefreshControls(props: Props) {
  const {
    enabled, onToggle, interval, onIntervalChange,
    refreshing, onManualRefresh, lastUpdated,
  } = props;

  const timeStr = (() => {
    try {
      return new Date(lastUpdated).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch { return "—"; }
  })();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* auto refresh toggle */}
      <button
        onClick={() => onToggle(!enabled)}
        className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
          enabled
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
        }`}
      >
        {enabled ? "Auto ON" : "Auto OFF"}
      </button>

      {/* interval selector */}
      <select
        value={interval}
        onChange={(e) => onIntervalChange(Number(e.target.value) as RefreshInterval)}
        className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
      >
        {INTERVALS.map((v) => (
          <option key={v} value={v}>{v}s</option>
        ))}
      </select>

      {/* manual refresh */}
      <button
        onClick={onManualRefresh}
        disabled={refreshing}
        className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
      >
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>

      {/* spinner + timestamp */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {refreshing && (
          <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        )}
        <span>Updated: {timeStr}</span>
      </div>
    </div>
  );
}
