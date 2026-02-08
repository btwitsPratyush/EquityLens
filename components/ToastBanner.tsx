"use client";

import { AlertTriangle, CheckCircle, X, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ToastMessage {
    id: string;
    type: "warning" | "success" | "info" | "error";
    message: string;
}

export function ToastBanner({ alerts }: { alerts: ToastMessage[] }) {
    const [visibleAlerts, setVisibleAlerts] = useState<ToastMessage[]>(alerts);

    useEffect(() => {
        setVisibleAlerts(alerts);
    }, [alerts]);

    const removeAlert = (id: string) => {
        setVisibleAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {visibleAlerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={cn(
                            "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md",
                            alert.type === "warning" && "bg-amber-50/90 border-amber-200 text-amber-900 dark:bg-amber-950/90 dark:border-amber-900 dark:text-amber-100",
                            alert.type === "error" && "bg-rose-50/90 border-rose-200 text-rose-900 dark:bg-rose-950/90 dark:border-rose-900 dark:text-rose-100",
                            alert.type === "success" && "bg-emerald-50/90 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-900 dark:text-emerald-100",
                            alert.type === "info" && "bg-blue-50/90 border-blue-200 text-blue-900 dark:bg-blue-950/90 dark:border-blue-900 dark:text-blue-100"
                        )}
                    >
                        <div className="mt-0.5">
                            {alert.type === "warning" && <AlertTriangle className="h-4 w-4" />}
                            {alert.type === "error" && <AlertTriangle className="h-4 w-4" />}
                            {alert.type === "success" && <CheckCircle className="h-4 w-4" />}
                            {alert.type === "info" && <Info className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 text-sm font-medium leading-tight">
                            {alert.message}
                        </div>
                        <button
                            onClick={() => removeAlert(alert.id)}
                            className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
