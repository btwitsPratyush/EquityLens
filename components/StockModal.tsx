"use client";

import { useState, useEffect } from "react";
import type { Stock } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: Stock) => void;
  editData?: Stock | null; // null = add mode, Stock = edit mode
}

const EMPTY: Stock = {
  stockName: "",
  purchasePrice: 0,
  quantity: 0,
  exchangeCode: "",
  sector: "",
};

export default function StockModal({ isOpen, onClose, onSave, editData }: Props) {
  const [form, setForm] = useState<Stock>(EMPTY);

  useEffect(() => {
    if (isOpen) {
      setForm(editData ?? EMPTY);
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.stockName.trim() || !form.exchangeCode.trim()) return;
    if (form.purchasePrice <= 0 || form.quantity <= 0) return;
    onSave(form);
    onClose();
  }

  function set(field: keyof Stock, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {editData ? "Edit Holding" : "Add New Holding"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Stock Name</label>
            <input
              type="text"
              value={form.stockName}
              onChange={(e) => set("stockName", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Reliance Industries"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">Purchase Price</label>
              <input
                type="number"
                step="0.01"
                value={form.purchasePrice || ""}
                onChange={(e) => set("purchasePrice", parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">Quantity</label>
              <input
                type="number"
                value={form.quantity || ""}
                onChange={(e) => set("quantity", parseInt(e.target.value, 10) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Exchange Code</label>
            <input
              type="text"
              value={form.exchangeCode}
              onChange={(e) => set("exchangeCode", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. RELIANCE.NS"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Sector</label>
            <input
              type="text"
              value={form.sector}
              onChange={(e) => set("sector", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Technology"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
            >
              {editData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
