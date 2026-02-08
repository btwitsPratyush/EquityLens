"use client";

// import { Card, CardContent } from "@/components/ui/card"; // converting to custom if shadcn not fully present, but using div for now
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, PieChart, DollarSign } from "lucide-react";
import { inr, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number | null;
}

export default function SummaryCards({
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  totalGainLossPercent,
}: Props) {
  const isProfit = totalGainLoss >= 0;

  const cards = [
    {
      label: "Net Worth",
      value: inr(totalPresentValue),
      subValue: "Current Value",
      icon: Wallet,
      trend: isProfit ? "up" : "down",
      trendValue: pct(totalGainLossPercent),
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
    },
    {
      label: "Total Investment",
      value: inr(totalInvestment),
      subValue: "Invested Amount",
      icon: DollarSign,
      trend: "neutral" as const,
      trendValue: null,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-500/15",
    },
    {
      label: "Total P&L",
      value: inr(totalGainLoss),
      subValue: "Overall Return",
      icon: TrendingUp,
      trend: isProfit ? "up" : "down",
      trendValue: inr(totalGainLoss),
      iconColor: isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      iconBg: isProfit ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-rose-100 dark:bg-rose-500/15",
    },
    {
      label: "Portfolio Yield",
      value: pct(totalGainLossPercent),
      subValue: "ROI",
      icon: PieChart,
      trend: isProfit ? "up" : "down",
      trendValue: pct(totalGainLossPercent),
      iconColor: isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      iconBg: isProfit ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-rose-100 dark:bg-rose-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/60 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:bg-card/40 backdrop-blur-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2.5 rounded-xl transition-colors", card.iconBg)}>
              <card.icon className={cn("h-5 w-5", card.iconColor)} />
            </div>
            {card.trend !== "neutral" && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  card.trend === "up"
                    ? "text-teal-700 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20"
                    : "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
                )}
              >
                {card.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {card.trendValue}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {card.label}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {card.value}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {card.subValue}
            </p>
          </div>

          {/* Decorative gradient blob */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl group-hover:from-primary/10 transition-all" />
        </div>
      ))}
    </div>
  );
}
