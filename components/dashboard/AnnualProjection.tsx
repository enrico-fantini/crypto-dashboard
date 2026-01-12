"use client";

import { useMemo } from "react";
import { Transaction } from "@/types/Transactions";
import { Calendar, Target } from "lucide-react";

interface Props {
  transactions: Transaction[];
  monthlySavings: number;
}

export function AnnualProjection({ transactions, monthlySavings }: Props) {
  const projection = useMemo(() => {
    const now = new Date();
    const monthsRemaining = 12 - now.getMonth();
    const annualProjection = monthlySavings * 12;
    const remainingProjection = monthlySavings * monthsRemaining;

    // Calcola risparmio totale attuale
    const totalSavings = transactions.reduce((acc, t) => {
      if (t.type === "income") acc += t.amount;
      else acc -= t.amount;
      return acc;
    }, 0);

    return {
      annualProjection,
      remainingProjection,
      totalSavings,
      monthsRemaining,
      onTrack: totalSavings >= 0,
    };
  }, [transactions, monthlySavings]);

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calendar className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Proiezione Annuale
          </h3>
          <p className="text-xs text-slate-500">
            Basata sul risparmio medio mensile
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <span className="text-sm text-slate-600">
            Risparmio Totale Attuale
          </span>
          <span
            className={`text-lg font-bold ${
              projection.totalSavings >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            €{projection.totalSavings.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <span className="text-sm text-slate-600">Proiezione Annuale</span>
          <span className="text-lg font-bold text-blue-600">
            €{projection.annualProjection.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <span className="text-sm text-slate-600">
            Proiezione Restante ({projection.monthsRemaining} mesi)
          </span>
          <span className="text-lg font-bold text-indigo-600">
            €{projection.remainingProjection.toFixed(2)}
          </span>
        </div>

        {projection.onTrack && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2">
            <Target className="text-green-600" size={16} />
            <p className="text-sm text-green-800 font-medium">
              Sei sulla buona strada! Continua così.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
