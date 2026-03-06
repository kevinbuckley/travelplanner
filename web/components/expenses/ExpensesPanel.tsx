"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, DollarSign } from "lucide-react";
import type { Expense, Trip } from "@/lib/types";
import ExpenseDialog from "./ExpenseDialog";

interface ExpensesPanelProps {
  trip: Trip;
  onUpdateTrip: (changes: Partial<Trip>) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  accommodation: "🏨",
  food: "🍽️",
  transport: "✈️",
  activity: "🎟️",
  shopping: "🛍️",
  other: "📦",
};

const CATEGORY_LABELS: Record<string, string> = {
  accommodation: "Accommodation",
  food: "Food & Drink",
  transport: "Transport",
  activity: "Activity",
  shopping: "Shopping",
  other: "Other",
};

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function ExpensesPanel({ trip, onUpdateTrip }: ExpensesPanelProps) {
  const [editing, setEditing] = useState<Expense | null | "new">(null);

  const expenses = [...trip.expenses].sort((a, b) => {
    if (a.dateIncurred !== b.dateIncurred) return a.dateIncurred.localeCompare(b.dateIncurred);
    return a.sortOrder - b.sortOrder;
  });

  // Total in trip's budget currency (only same-currency expenses)
  const budgetCurrency = trip.budgetCurrencyCode || "USD";
  const totalSpent = expenses
    .filter((e) => e.currencyCode === budgetCurrency)
    .reduce((sum, e) => sum + e.amount, 0);
  const hasBudget = trip.budgetAmount > 0;

  function saveExpense(expense: Expense) {
    const exists = trip.expenses.find((e) => e.id === expense.id);
    const updated = exists
      ? trip.expenses.map((e) => (e.id === expense.id ? expense : e))
      : [...trip.expenses, { ...expense, sortOrder: trip.expenses.length }];
    onUpdateTrip({ expenses: updated });
    setEditing(null);
  }

  function deleteExpense(id: string) {
    onUpdateTrip({ expenses: trip.expenses.filter((e) => e.id !== id) });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Budget summary */}
      {(hasBudget || expenses.length > 0) && (
        <div className="mx-5 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Budget Summary</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {formatAmount(totalSpent, budgetCurrency)}
              </div>
              {hasBudget && (
                <div className="text-xs text-slate-400">
                  of {formatAmount(trip.budgetAmount, budgetCurrency)} budget
                </div>
              )}
            </div>
            {hasBudget && (
              <div className={`text-sm font-medium ${totalSpent > trip.budgetAmount ? "text-red-500" : "text-green-600"}`}>
                {totalSpent > trip.budgetAmount
                  ? `${formatAmount(totalSpent - trip.budgetAmount, budgetCurrency)} over`
                  : `${formatAmount(trip.budgetAmount - totalSpent, budgetCurrency)} left`}
              </div>
            )}
          </div>
          {hasBudget && (
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${totalSpent > trip.budgetAmount ? "bg-red-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(100, (totalSpent / trip.budgetAmount) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="px-5 py-4 space-y-2">
        {expenses.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">
            No expenses yet. Track what you spend on this trip.
          </p>
        )}

        {expenses.map((exp) => (
          <div
            key={exp.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white group"
          >
            <span className="text-xl">{CATEGORY_ICONS[exp.categoryRaw]}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">{exp.title}</div>
              <div className="text-xs text-slate-400">
                {CATEGORY_LABELS[exp.categoryRaw]}
                {exp.dateIncurred && (
                  <> · {new Date(exp.dateIncurred + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</>
                )}
              </div>
              {exp.notes && (
                <div className="text-xs text-slate-400 italic truncate">{exp.notes}</div>
              )}
            </div>
            <div className="text-sm font-semibold text-slate-700 shrink-0">
              {formatAmount(exp.amount, exp.currencyCode)}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditing(exp)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteExpense(exp.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add expense
        </button>
      </div>

      {editing !== null && (
        <ExpenseDialog
          expense={editing === "new" ? null : editing}
          defaultCurrency={trip.budgetCurrencyCode || "USD"}
          onSave={saveExpense}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
