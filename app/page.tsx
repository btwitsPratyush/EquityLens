"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { PortfolioLiveResponse, PortfolioRow, Stock } from "@/types";
import { computeHealthScore } from "@/lib/healthScore";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAlerts } from "@/hooks/useAlerts";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { Navbar } from "@/components/Navbar";
import { DashboardLayout } from "@/components/DashboardLayout";
import SummaryCards from "@/components/SummaryCards";
import HealthScoreCard from "@/components/HealthScoreCard";
import SectorPieChart from "@/components/SectorPieChart";
import HeatmapGrid from "@/components/HeatmapGrid";
import PortfolioTable from "@/components/PortfolioTable";
import { ToastBanner, ToastMessage } from "@/components/ToastBanner";
import StockModal from "@/components/StockModal";
import StockDrawer from "@/components/StockDrawer";
import StockSearch from "@/components/StockSearch";
import CsvUpload from "@/components/CsvUpload";
import AlertsPanel from "@/components/AlertsPanel";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { RefreshCw, Plus, Upload, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const portfolio = usePortfolio();
  const alertsHook = useAlerts();
  const [data, setData] = useState<PortfolioLiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [drawerStock, setDrawerStock] = useState<PortfolioRow | null>(null);

  // Using ToastBanner for alerts logic transformation
  const [toastAlerts, setToastAlerts] = useState<ToastMessage[]>([]);

  // fetch live data using current portfolio stocks
  const fetchLive = useCallback(async () => {
    if (!portfolio.loaded || portfolio.stocks.length === 0) {
      setLoading(false);
      return;
    }

    // Only set loading true if it's the initial load or explicit retry, not on background refresh
    if (!data) setLoading(true);

    try {
      setError(null);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiBase}/api/portfolio/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks: portfolio.stocks }),
      });
      if (!res.ok) throw new Error("failed to fetch");
      const json: PortfolioLiveResponse = await res.json();
      setData(json);

      // check price alerts
      const triggered = alertsHook.checkAlerts(json.rows);
      if (triggered.length > 0) {
        const newToasts: ToastMessage[] = triggered.map(a => ({
          id: Date.now().toString() + Math.random(),
          type: "warning",
          message: `Alert: ${a.stockName} is ${a.condition} ₹${a.targetPrice}`
        }));
        setToastAlerts(prev => [...prev, ...newToasts]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setLoading(false);
    }
  }, [portfolio.loaded, portfolio.stocks, alertsHook, data]);

  // auto refresh hook
  const refresh = useAutoRefresh(fetchLive);

  // initial fetch
  useEffect(() => {
    if (portfolio.loaded) fetchLive();
  }, [portfolio.loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // health score
  const healthScore = useMemo(() => {
    if (!data) return null;
    return computeHealthScore(data.rows, data.sectorSummaries, data.totalGainLossPercent);
  }, [data]);

  // --- CRUD handlers ---
  function handleAddStock(stock: Stock) {
    portfolio.addStock(stock);
    setToastAlerts(prev => [...prev, { id: Date.now().toString(), type: "success", message: `Added ${stock.stockName} to portfolio` }]);
  }

  function handleEditClick(row: PortfolioRow) {
    // find index in portfolio.stocks based on exchangeCode or name
    const index = portfolio.stocks.findIndex(s => s.exchangeCode === row.exchangeCode);
    if (index !== -1) {
      setEditIndex(index);
      setModalOpen(true);
    }
  }

  function handleModalSave(stock: Stock) {
    if (editIndex != null) {
      portfolio.updateStock(editIndex, stock);
      setToastAlerts(prev => [...prev, { id: Date.now().toString(), type: "success", message: `Updated ${stock.stockName}` }]);
    } else {
      portfolio.addStock(stock);
      setToastAlerts(prev => [...prev, { id: Date.now().toString(), type: "success", message: `Added ${stock.stockName}` }]);
    }
    setEditIndex(null);
    fetchLive();
  }

  function handleDelete(row: PortfolioRow) {
    const index = portfolio.stocks.findIndex(s => s.exchangeCode === row.exchangeCode);
    if (index !== -1) {
      portfolio.removeStock(index);
      setToastAlerts(prev => [...prev, { id: Date.now().toString(), type: "info", message: `Removed ${row.stockName}` }]);
      // Setup data update locally or Refetch
      // fetchLive(); // Optimistic update ideally, but fetch is safe
    }
  }

  function handleCsvImport(stocks: Stock[]) {
    portfolio.replaceAll(stocks);
    setToastAlerts(prev => [...prev, { id: Date.now().toString(), type: "success", message: `Imported ${stocks.length} stocks from CSV` }]);
  }

  // Combine internal toasts with alertsHook.alerts if needed, but for now using local state bridge
  // Actually alertsHook.alerts contains definitions, triggered contains triggered ones.
  // We used triggered to populate toastAlerts.

  const isLoading = !portfolio.loaded || (loading && !data);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar
        onRefresh={() => { setLoading(true); refresh.manualRefresh(); }}
        isRefreshing={refresh.refreshing || loading}
      />

      <DashboardLayout>

        {/* Top Summary Section */}
        <section className="animate-fade-in">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : (data &&
            <SummaryCards
              totalInvestment={data.totalInvestment}
              totalPresentValue={data.totalPresentValue}
              totalGainLoss={data.totalGainLoss}
              totalGainLossPercent={data.totalGainLossPercent}
            />
          )}
        </section>

        {/* Error / Partial Failure Warning */}
        {error && (
          <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Failed to fetch live data</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">{error}. Check your network or try refreshing.</p>
            </div>
            <button
              onClick={() => { setError(null); setLoading(true); fetchLive(); }}
              className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {!error && data?.partialFailure && data.totalPresentValue === 0 && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Yahoo Finance is having issues</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">Live stock prices couldn&apos;t be fetched. This is a known issue with Yahoo Finance API. Try refreshing or check back later.</p>
            </div>
            <button
              onClick={() => { setLoading(true); fetchLive(); }}
              className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Bento Grid: Charts & Health */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* Sector Chart - 4 cols */}
          <div className="lg:col-span-4 h-[350px]">
            {isLoading ? <SkeletonLoader className="h-full w-full rounded-2xl" /> : (data && <SectorPieChart sectors={data.sectorSummaries} />)}
          </div>

          {/* Portfolio Health - 3 cols */}
          <div className="lg:col-span-3 h-[350px]">
            {isLoading ? <SkeletonLoader className="h-full w-full rounded-2xl" /> : (healthScore && <HealthScoreCard health={healthScore} />)}
          </div>

          {/* Heatmap - 5 cols */}
          <div className="lg:col-span-5 h-[350px]">
            {isLoading ? <SkeletonLoader className="h-full w-full rounded-2xl" /> : (data && <HeatmapGrid rows={data.rows} />)}
          </div>
        </section>

        {/* Main Data Table */}
        <section className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Holdings <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{data?.rows.length || 0}</span>
            </h2>

            {/* Actions Toolbar */}
            <div id="alerts-section" className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <StockSearch onAdd={handleAddStock} />
              <CsvUpload onImport={handleCsvImport} />
              {data && (
                <AlertsPanel
                  alerts={alertsHook.alerts}
                  rows={data.rows}
                  onAdd={alertsHook.addAlert}
                  onRemove={alertsHook.removeAlert}
                  onClearTriggered={alertsHook.clearTriggered}
                />
              )}
              <button
                onClick={() => { setEditIndex(null); setModalOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm active:scale-95"
              >
                <Plus className="h-4 w-4" /> Add Stock
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <SkeletonLoader className="h-10 w-full rounded-lg" />
              {[1, 2, 3, 4, 5].map(i => <SkeletonLoader key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : (data &&
            <PortfolioTable
              rows={data.rows}
              onRowClick={setDrawerStock}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          )}
        </section>

      </DashboardLayout>

      <ToastBanner alerts={toastAlerts} />

      {/* Modals */}
      <StockModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditIndex(null); }}
        onSave={handleModalSave}
        editData={editIndex != null ? portfolio.stocks[editIndex] : null}
      />

      <StockDrawer
        stock={drawerStock}
        onClose={() => setDrawerStock(null)}
      />
    </div>
  );
}
