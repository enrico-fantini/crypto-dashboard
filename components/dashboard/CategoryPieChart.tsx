"use client";

import { useMemo, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Transaction } from "@/types/Transactions";
import { TooltipProps, LabelProps, COLORS } from "@/types/PieChart";

// Custom tooltip con percentuale (fuori dal componente per evitare re-render)
const CustomTooltip = ({
  active,
  payload,
  total,
}: TooltipProps & { total: number }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / total) * 100).toFixed(1);
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-900">{data.name}</p>
        <p className="text-sm text-slate-600">
          €{data.value.toFixed(2)} ({percentage}%)
        </p>
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
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
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

  // Calcola il totale per la percentuale (prima dei return condizionali)
  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  // Custom label con percentuale
  const renderLabel = useCallback(
    (entry: LabelProps) => {
      const percentage = ((entry.value / total) * 100).toFixed(1);
      return `${entry.name}: ${percentage}%`;
    },
    [total]
  );

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-lg bg-white">
        <p className="text-slate-500">Nessun dato disponibile</p>
      </div>
    );
  }

  return (
    <div className="w-full max-h-[400px] p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-sm font-medium text-white">Entrate e Uscite</h3>
      <ResponsiveContainer width="100%" height="100%" className="pb-6">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => {
              const item = chartData.find((d) => d.name === value);
              if (item) {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return `${value} (${percentage}%)`;
              }
              return value;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
