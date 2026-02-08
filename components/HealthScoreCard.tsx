"use client";

import { HealthResult } from "@/lib/healthScore";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const gradeColors: Record<string, string> = {
  A: "text-emerald-500",
  B: "text-emerald-500",
  C: "text-amber-500",
  D: "text-rose-500",
  F: "text-rose-600",
};

const gradeBgColors: Record<string, string> = {
  A: "#10b981", // emerald-500
  B: "#10b981",
  C: "#f59e0b", // amber-500
  D: "#f43f5e", // rose-500
  F: "#e11d48", // rose-600
};

export default function HealthScoreCard({ health }: { health: HealthResult }) {
  const score = health.score;
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];

  const activeColor = gradeBgColors[health.grade] || "#94a3b8";

  return (
    <div className="h-full p-0 overflow-hidden flex flex-col relative rounded-2xl border border-border/50 bg-card shadow-sm">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Portfolio Health
          </h3>
          <span className={cn("text-2xl font-black", gradeColors[health.grade])}>
            {health.grade}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center relative h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="65%"
              startAngle={180}
              endAngle={0}
              innerRadius={50}
              outerRadius={68}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={activeColor} className="drop-shadow-lg" />
              <Cell fill="var(--muted)" className="opacity-20" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black tracking-tighter text-foreground">
              {score}
            </span>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
              / 100 Score
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border/50 mt-2">
        {Object.entries(health.breakdown).map(([key, val]) => (
          <div key={key} className="bg-background/60 backdrop-blur-sm p-3 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors">
            <span className="text-[9px] text-muted-foreground/90 uppercase tracking-wider font-bold mb-1">
              {key}
            </span>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-lg font-bold", val >= 20 ? "text-emerald-500 dark:text-emerald-400" : (val >= 15 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"))}>
                {val}
              </span>
              <span className="text-[10px] text-muted-foreground/80 font-medium">/25</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
