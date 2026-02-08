"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Navbar({ onRefresh, isRefreshing }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="EquityLens"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="hidden md:flex flex-col gap-0.5">
              <span className="font-logo font-semibold tracking-tight text-xl leading-none text-foreground">
                EquityLens
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
                Portfolio Analytics
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onRefresh}
            className={cn(
              "p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
              isRefreshing && "animate-spin text-primary"
            )}
            title="Refresh Data"
            disabled={isRefreshing}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
