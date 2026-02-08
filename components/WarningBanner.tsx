"use client";

// shown when some tickers failed to fetch - keeps the UI stable
export default function WarningBanner() {
  return (
    <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm">
      ⚠ Some live data couldn&apos;t be fetched. Showing &quot;N/A&quot; where unavailable.
    </div>
  );
}
