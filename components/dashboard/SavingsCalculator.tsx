"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

export function SavingsCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [targetSavings, setTargetSavings] = useState("");
  const [currentExpenses, setCurrentExpenses] = useState("");

  const calculateSavings = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const expenses = parseFloat(currentExpenses) || 0;
    const target = parseFloat(targetSavings) || 0;

    const currentSavings = income - expenses;
    const neededSavings = target - currentSavings;
    const savingsPercentage = income > 0 ? (target / income) * 100 : 0;
    const maxExpenses = income - target;

    return {
      currentSavings,
      neededSavings,
      savingsPercentage,
      maxExpenses,
      isAchievable: neededSavings <= 0,
    };
  };

  const results = calculateSavings();

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Calculator className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Calcolatore Risparmio
          </h3>
          <p className="text-sm text-slate-500">
            Calcola quanto puoi risparmiare mensilmente
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Stipendio Mensile (€)
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="Stipendio mensile..."
            className="w-full px-3 py-2 border text-gray-600 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Spese Mensili Attuali (€)
          </label>
          <input
            type="number"
            value={currentExpenses}
            onChange={(e) => setCurrentExpenses(e.target.value)}
            placeholder="Spese mensili..."
            className="w-full px-3 py-2 border text-gray-600 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Obiettivo Risparmio Mensile (€)
          </label>
          <input
            type="number"
            value={targetSavings}
            onChange={(e) => setTargetSavings(e.target.value)}
            placeholder="Risparmio mensile..."
            className="w-full px-3 py-2 border text-gray-600 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {monthlyIncome && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Risparmio Attuale:</span>
              <span
                className={`font-semibold ${
                  results.currentSavings >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                €{results.currentSavings.toFixed(2)}
              </span>
            </div>

            {targetSavings && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Differenza Obiettivo:
                  </span>
                  <span
                    className={`font-semibold ${
                      results.isAchievable ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {results.isAchievable ? "+" : ""}€
                    {results.neededSavings.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    % Risparmio Obiettivo:
                  </span>
                  <span className="font-semibold text-blue-600">
                    {results.savingsPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">
                    Per raggiungere l&apos;obiettivo:
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    Spese massime:{" "}
                    <span className="text-blue-600">
                      €{results.maxExpenses.toFixed(2)}
                    </span>
                  </p>
                </div>

                {!results.isAchievable && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ⚠️ L&apos;obiettivo non è raggiungibile con le spese
                      attuali. Riduci le spese di €
                      {Math.abs(results.neededSavings).toFixed(2)}.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
