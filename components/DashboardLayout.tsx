"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "min-h-screen bg-muted/20 pb-10",
                className
            )}
        >
            <div className="container mx-auto px-4 py-6 md:py-8 space-y-8">
                {children}
            </div>
        </motion.main>
    );
}
