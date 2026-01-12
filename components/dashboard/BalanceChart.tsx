"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/types/Transactions";

export const BalanceChart = ({ data }: { data: Transaction[] }) => {
  // Trasformiamo i dati grezzi per il grafico
  // Mostriamo il saldo cumulativo giorno per giorno
  const chartData = useMemo(() => {
    return data
      .slice() // Creiamo una copia per non mutare l'originale
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc, t, index) => {
        const value = t.type === "income" ? t.amount : -t.amount;
        const cumulativeBalance = (acc[index - 1]?.balance || 0) + value;

        acc.push({
          date: new Date(t.date).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
          }),
          balance: cumulativeBalance,
        });

        return acc;
      }, [] as Array<{ date: string; balance: number }>);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-lg">
        Nessun dato disponibile
      </div>
    );
  }

  return (
    <div
      className="h-[400px] w-full p-4 bg-white rounded-xl shadow-sm border border-slate-100"
      suppressHydrationWarning
    >
      <h3 className="text-sm font-medium text-slate-500 mb-4">
        Andamento Saldo
      </h3>
      <ResponsiveContainer width="100%" height="100%" className="pb-6">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value) => `€${value}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBalance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
