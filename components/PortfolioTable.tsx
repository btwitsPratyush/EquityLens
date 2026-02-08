"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { PortfolioRow } from "@/types";
import { inr, pct, num } from "@/lib/format";
import { ArrowUpDown, ChevronDown, ChevronRight, Search, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  rows: PortfolioRow[];
  onRowClick?: (row: PortfolioRow) => void;
  onEdit?: (row: PortfolioRow) => void;
  onDelete?: (row: PortfolioRow) => void;
}

export default function PortfolioTable({ rows, onRowClick, onEdit, onDelete }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({});

  // Group rows by sector
  const sectorGroups = useMemo(() => {
    const groups: Record<string, PortfolioRow[]> = {};
    const sectors: string[] = [];

    rows.forEach(row => {
      if (!groups[row.sector]) {
        groups[row.sector] = [];
        sectors.push(row.sector);
      }
      groups[row.sector].push(row);
    });

    // Sort sectors alphabetically
    sectors.sort();

    // Initialize all expanded
    if (Object.keys(expandedSectors).length === 0 && sectors.length > 0) {
      const initial: Record<string, boolean> = {};
      sectors.forEach(s => initial[s] = true);
      setExpandedSectors(initial);
    }

    return { groups, sectors };
  }, [rows]); // Intentionally not including expandedSectors in dep array to avoid reset

  const toggleSector = (sector: string) => {
    setExpandedSectors(prev => ({ ...prev, [sector]: !prev[sector] }));
  };

  const columns: ColumnDef<PortfolioRow>[] = useMemo(
    () => [
      {
        accessorKey: "stockName",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            STOCK
            <ArrowUpDown className="h-3 w-3" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{row.original.stockName}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{row.original.exchangeCode}</span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "quantity",
        header: "QTY",
        cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.quantity}</span>,
      },
      {
        accessorKey: "purchasePrice",
        header: "AVG PRICE",
        cell: ({ row }) => <span className="font-mono">{inr(row.original.purchasePrice)}</span>,
      },
      {
        accessorKey: "cmp",
        header: "LTP",
        cell: ({ row }) => {
          const cmp = row.original.cmp;
          return cmp ? <span className="font-mono font-medium text-foreground">{inr(cmp)}</span> : <span className="text-muted-foreground italic text-xs">Fetching...</span>;
        }
      },
      {
        accessorKey: "presentValue",
        header: "CURRENT VALUE",
        cell: ({ row }) => <span className="font-mono font-semibold">{inr(row.original.presentValue)}</span>,
      },
      {
        accessorKey: "gainLoss",
        header: "P&L",
        cell: ({ row }) => {
          const val = row.original.gainLoss;
          if (val == null) return <span className="text-muted-foreground">-</span>;
          const isProfit = val >= 0;
          return (
            <span className={cn("font-mono font-bold", isProfit ? "text-teal-700 dark:text-teal-400" : "text-orange-700 dark:text-orange-400")}>
              {isActive(row.original) ? (isProfit ? "+" : "") + inr(val) : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "gainLossPercent",
        header: "% CHG",
        cell: ({ row }) => {
          const val = row.original.gainLossPercent;
          if (val == null) return <span className="text-muted-foreground">-</span>;
          const isProfit = val >= 0;
          return (
            <div className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold",
              isProfit ? "bg-teal-100 text-teal-700 dark:bg-teal-900/25 dark:text-teal-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/25 dark:text-orange-400"
            )}>
              {isProfit ? "▲" : "▼"} {Math.abs(val).toFixed(2)}%
            </div>
          );
        },
      },
    ],
    []
  );

  // Helper to check if row has valid live data
  const isActive = (r: PortfolioRow) => r.cmp != null;

  // Filter logic handled manually for the grouped structure or just flat list
  // Actually, standard table is better for sorting. 
  // User wanted "Sector collapsible sections". 
  // To combine both custom grouping and tanstack table is complex.
  // I will build a custom renderer using the generic matching components/styles but iterating manually for groups.

  const filteredGroups = useMemo(() => {
    const result: { sector: string; rows: PortfolioRow[]; summary: any }[] = [];

    sectorGroups.sectors.forEach(sector => {
      const sectorRows = sectorGroups.groups[sector].filter(r =>
        r.stockName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        r.exchangeCode.toLowerCase().includes(globalFilter.toLowerCase())
      );

      if (sectorRows.length > 0) {
        // Calculate sector totals
        const totalInv = sectorRows.reduce((sum, r) => sum + r.investment, 0);
        const totalPV = sectorRows.reduce((sum, r) => sum + (r.presentValue || 0), 0);
        const totalGL = totalPV - totalInv;
        const totalGLP = totalInv > 0 ? (totalGL / totalInv) * 100 : 0;

        result.push({
          sector,
          rows: sectorRows,
          summary: { totalInv, totalPV, totalGL, totalGLP }
        });
      }
    });
    return result;
  }, [sectorGroups, globalFilter]);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Filter stocks..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-card px-9 py-1 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-[11px] border-b border-border">
              <tr>
                <th className="px-3 py-3 pl-6">Particulars</th>
                <th className="px-3 py-3 text-right">Purchase Price</th>
                <th className="px-3 py-3 text-right">Qty</th>
                <th className="px-3 py-3 text-right">Investment</th>
                <th className="px-3 py-3 text-right">Portfolio (%)</th>
                <th className="px-3 py-3 text-right">NSE/BSE</th>
                <th className="px-3 py-3 text-right">CMP</th>
                <th className="px-3 py-3 text-right">Present Value</th>
                <th className="px-3 py-3 text-right">Gain/Loss</th>
                <th className="px-3 py-3 text-right">P/E Ratio</th>
                <th className="px-3 py-3 text-right pr-6">Latest Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredGroups.map((group) => (
                <React.Fragment key={group.sector}>
                  {/* Sector Header */}
                  <tr
                    className="bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => toggleSector(group.sector)}
                  >
                    <td colSpan={11} className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1 rounded-md bg-muted transition-transform duration-200", expandedSectors[group.sector] ? "rotate-90" : "")}>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="font-bold text-foreground">{group.sector}</span>
                          <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full border border-border">
                            {group.rows.length}
                          </span>
                        </div>

                        {/* Sector Summary Mini */}
                        <div className="flex items-center gap-6 text-xs mr-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <div className="hidden sm:block">
                            <span className="text-muted-foreground mr-1">Inv:</span>
                            <span className="font-mono">{inr(group.summary.totalInv)}</span>
                          </div>
                          <div className="hidden sm:block">
                            <span className="text-muted-foreground mr-1">Val:</span>
                            <span className="font-mono">{inr(group.summary.totalPV)}</span>
                          </div>
                          <div className={cn("font-bold font-mono", group.summary.totalGL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                            {group.summary.totalGL >= 0 ? "+" : ""}{inr(group.summary.totalGL)}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Stock Rows */}
                  <AnimatePresence>
                    {expandedSectors[group.sector] && group.rows.map((row) => (
                      <motion.tr
                        key={row.exchangeCode}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card hover:bg-muted/20 transition-colors group/row"
                        onClick={() => onRowClick?.(row)}
                      >
                        <td className="px-3 py-3 pl-6">
                          <span className="font-bold text-foreground group-hover/row:text-primary transition-colors">{row.stockName}</span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">{inr(row.purchasePrice)}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">{row.quantity}</td>
                        <td className="px-3 py-3 text-right font-mono">{inr(row.investment)}</td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">{row.portfolioPercent.toFixed(2)}%</td>
                        <td className="px-3 py-3 text-right font-mono text-[10px] text-muted-foreground">{row.exchangeCode}</td>
                        <td className="px-3 py-3 text-right font-mono font-medium">
                          {row.cmp ? inr(row.cmp) : <span className="opacity-50 text-[10px]">...</span>}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold">{inr(row.presentValue)}</td>
                        <td className="px-3 py-3 text-right font-mono">
                          {row.gainLoss != null ? (
                            <span className={row.gainLoss >= 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                              {row.gainLoss >= 0 ? "+" : ""}{inr(row.gainLoss)}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                          {row.peRatio != null ? row.peRatio.toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-muted-foreground pr-6 max-w-[120px] truncate" title={row.latestEarnings ?? ""}>
                          {row.latestEarnings ?? "—"}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              ))}

              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-muted-foreground">
                    No stocks found matching "{globalFilter}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
