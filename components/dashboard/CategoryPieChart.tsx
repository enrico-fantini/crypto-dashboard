"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Transaction } from "@/types/Transactions";
import { COLORS } from "@/types/PieChart";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: { name: string; value: number } }[];
  total: number;
}

const CustomTooltip = ({ active, payload, total }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / total) * 100).toFixed(1);
    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100 z-50">
        <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          {data.name}
        </p>
        <p className="text-sm text-blue-600 font-mono mt-1">
          €{data.value.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] text-slate-400">{percentage}% del totale</p>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart = ({ data }: { data: Transaction[] }) => {
  const chartData = useMemo(() => {
    const result = Object.entries(
      data.reduce((acc, transaction) => {
        const category = transaction.category || "Altro";
        if (!acc[category]) acc[category] = 0;
        acc[category] += Math.abs(transaction.amount);
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);

    return result;
  }, [data]);

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (chartData.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center lg:items-center">
        <div className="w-full lg:w-3/5 h-[300px] sm:h-[350px] mb-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-slate-400 text-xs font-medium">Totale</span>
            <span className="text-xl font-bold text-slate-800">
              €{total.toLocaleString("it-IT")}
            </span>
          </div>
        </div>

        <div className="w-full lg:w-2/5 flex flex-col gap-3 p-8 rounded-4xl shadow-lg border-2 border-slate-200">
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-widest mb-2">
            Legenda Spese
          </p>
          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {chartData.map((entry, index) => {
              const percentage = ((entry.value / total) * 100).toFixed(1);
              return (
                <div
                  key={entry.name}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-semibold text-slate-700 truncate">
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-mono font-bold text-slate-900">
                      {percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 italic">
                      €{entry.value.toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
