"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { newId, nowISO } from "@/lib/types";
import { cn } from "@/components/ui/cn";

interface ExpenseDialogProps {
  expense?: Expense | null;
  defaultCurrency?: string;
  onSave: (expense: Expense) => void;
  onClose: () => void;
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "accommodation", label: "Accommodation", icon: "🏨" },
  { value: "food", label: "Food & Drink", icon: "🍽️" },
  { value: "transport", label: "Transport", icon: "✈️" },
  { value: "activity", label: "Activity", icon: "🎟️" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "other", label: "Other", icon: "📦" },
];

const COMMON_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "MXN", "BRL"];

function emptyExpense(currency: string): Expense {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: newId(),
    title: "",
    amount: 0,
    currencyCode: currency,
    categoryRaw: "other",
    notes: "",
    sortOrder: 0,
    createdAt: nowISO(),
    dateIncurred: today,
  };
}

export default function ExpenseDialog({ expense, defaultCurrency = "USD", onSave, onClose }: ExpenseDialogProps) {
  const [form, setForm] = useState<Expense>(() => expense ?? emptyExpense(defaultCurrency));

  function set<K extends keyof Expense>(key: K, value: Expense[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || form.amount <= 0) return;
    onSave({ ...form, id: form.id || newId() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-slate-800">
            {expense ? "Edit Expense" : "Add Expense"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="e.g. Dinner at Le Jules Verne"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Amount + Currency */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount || ""}
                onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
                required
                placeholder="0.00"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
              <select
                value={form.currencyCode}
                onChange={(e) => set("currencyCode", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => set("categoryRaw", cat.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-colors",
                    form.categoryRaw === cat.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                  )}
                >
                  <span className="text-base">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={form.dateIncurred}
              onChange={(e) => set("dateIncurred", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Optional notes…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              {expense ? "Save" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
