"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { SectorSummary } from "@/types";
import { inr } from "@/lib/format";

// Vibrant colors for light mode
const LIGHT_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
];

// Brighter saturated colors for dark mode visibility
const DARK_COLORS = [
  "#34d399", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa", "#f472b6", "#2dd4bf", "#fb923c"
];

export default function SectorPieChart({ sectors }: { sectors: SectorSummary[] }) {
  const data = useMemo(
    () =>
      sectors
        .map((s) => ({ name: s.sector, value: Math.round(s.totalInvestment) }))
        .sort((a, b) => b.value - a.value), // Sort by value desc
    [sectors]
  );

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  if (data.length === 0) return null;

  return (
    <div className="h-full p-6 flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
        Sector Allocation
      </h3>
      <div className="flex-1 w-full min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="40%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => {
                const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
                const colorPalette = isDark ? DARK_COLORS : LIGHT_COLORS;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorPalette[index % colorPalette.length]}
                    className="stroke-background stroke-2 outline-none"
                  />
                );
              })}
            </Pie>
            <Tooltip
              formatter={(val: number) => [inr(val), "Invested"]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderRadius: '12px',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                padding: '12px'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '12px' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: "11px",
                fontWeight: 600,
                color: "hsl(var(--muted-foreground))",
                lineHeight: "24px",
                paddingLeft: "20px"
              }}
              formatter={(value, entry: any) => {
                const percent = ((entry.payload.value / totalValue) * 100).toFixed(1);
                return (
                  <span className="text-foreground font-medium ml-1">
                    {value} <span className="text-muted-foreground/60 ml-1">({percent}%)</span>
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
