"use client";

import { useMemo } from "react";
import { Transaction } from "@/types/Transactions";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function MonthlyComparison({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const comparison = useMemo(() => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Transazioni mese corrente
    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= currentMonth;
    });

    // Transazioni mese precedente
    const lastMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= lastMonth && date <= lastMonthEnd;
    });

    // Calcola totali mese corrente
    const currentMonthData = currentMonthTransactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0, savings: 0 }
    );
    currentMonthData.savings =
      currentMonthData.income - currentMonthData.expense;

    // Calcola totali mese precedente
    const lastMonthData = lastMonthTransactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0, savings: 0 }
    );
    lastMonthData.savings = lastMonthData.income - lastMonthData.expense;

    // Calcola differenze
    const incomeDiff = currentMonthData.income - lastMonthData.income;
    const expenseDiff = currentMonthData.expense - lastMonthData.expense;
    const savingsDiff = currentMonthData.savings - lastMonthData.savings;

    // Calcola percentuali di variazione
    const incomeChange =
      lastMonthData.income > 0 ? (incomeDiff / lastMonthData.income) * 100 : 0;
    const expenseChange =
      lastMonthData.expense > 0
        ? (expenseDiff / lastMonthData.expense) * 100
        : 0;
    const savingsChange =
      lastMonthData.savings !== 0
        ? (savingsDiff / Math.abs(lastMonthData.savings)) * 100
        : 0;

    return {
      current: currentMonthData,
      last: lastMonthData,
      incomeDiff,
      expenseDiff,
      savingsDiff,
      incomeChange,
      expenseChange,
      savingsChange,
    };
  }, [transactions]);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="text-green-600" size={16} />;
    if (value < 0) return <TrendingDown className="text-red-600" size={16} />;
    return <Minus className="text-slate-400" size={16} />;
  };

  const getTrendColor = (value: number, isExpense = false) => {
    if (isExpense) {
      // Per le spese, meno è meglio
      return value < 0
        ? "text-green-600"
        : value > 0
        ? "text-red-600"
        : "text-slate-600";
    }
    // Per entrate e risparmi, più è meglio
    return value > 0
      ? "text-green-600"
      : value < 0
      ? "text-red-600"
      : "text-slate-600";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Confronto Mensile
      </h3>

      <div className="space-y-4">
        {/* Entrate */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Entrate</span>
            {getTrendIcon(comparison.incomeDiff)}
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                €{comparison.current.income.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">
                Mese precedente: €{comparison.last.income.toFixed(2)}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${getTrendColor(
                comparison.incomeChange
              )}`}
            >
              {comparison.incomeChange >= 0 ? "+" : ""}
              {comparison.incomeChange.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Uscite */}
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Uscite</span>
            {getTrendIcon(-comparison.expenseDiff)}
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                €{comparison.current.expense.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">
                Mese precedente: €{comparison.last.expense.toFixed(2)}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${getTrendColor(
                comparison.expenseChange,
                true
              )}`}
            >
              {comparison.expenseChange >= 0 ? "+" : ""}
              {comparison.expenseChange.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Risparmio */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Risparmio
            </span>
            {getTrendIcon(comparison.savingsDiff)}
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                €{comparison.current.savings.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">
                Mese precedente: €{comparison.last.savings.toFixed(2)}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${getTrendColor(
                comparison.savingsChange
              )}`}
            >
              {comparison.savingsDiff >= 0 ? "+" : ""}€
              {comparison.savingsDiff.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
