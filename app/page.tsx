"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { BalanceChart } from "@/components/dashboard/BalanceChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { SavingsCalculator } from "@/components/dashboard/SavingsCalculator";
import { MonthlyComparison } from "@/components/dashboard/MonthlyComparison";
import { AnnualProjection } from "@/components/dashboard/AnnualProjection";
import { Auth } from "@/components/Auth";
import { AddTransactionModal } from "@/components/dashboard/AddTransactionModal";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import {
  PlusIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  LogOut,
  TrendingUp,
} from "lucide-react"; // Icone moderne

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const { transactions, isLoading, isError } = useTransactions();

  useEffect(() => {
    // Controlla se l'utente è già autenticato
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };

    checkUser();

    // Ascolta i cambiamenti di autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Calcoli rapidi per le "Stats Cards" (deve essere prima dei return condizionali per React Hooks rules)
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === "income") acc.income += curr.amount;
        else acc.expense += curr.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const totalBalance = totals.income - totals.expense;

  // Calcolo risparmio mensile (media degli ultimi mesi)
  const monthlySavings = useMemo(() => {
    if (transactions.length === 0) return 0;

    // Raggruppa le transazioni per mese/anno
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expense: 0 };
      }

      if (transaction.type === "income") {
        acc[monthKey].income += transaction.amount;
      } else {
        acc[monthKey].expense += transaction.amount;
      }

      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    // Calcola il risparmio per ogni mese
    const savingsByMonth = Object.values(monthlyData).map(
      (month) => month.income - month.expense
    );

    // Calcola la media del risparmio mensile
    if (savingsByMonth.length === 0) return 0;
    const averageSavings =
      savingsByMonth.reduce((sum, saving) => sum + saving, 0) /
      savingsByMonth.length;

    return averageSavings;
  }, [transactions]);

  // Risparmio dell'ultimo mese completo
  const lastMonthSavings = useMemo(() => {
    if (transactions.length === 0) return 0;

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= lastMonth && transactionDate <= lastMonthEnd;
    });

    const lastMonthData = lastMonthTransactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return lastMonthData.income - lastMonthData.expense;
  }, [transactions]);

  // Mostra caricamento mentre controlla l'autenticazione
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Mostra componente di autenticazione se non autenticato
  if (!user) {
    return (
      <Auth
        onAuthSuccess={async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          setUser(user);
        }}
      />
    );
  }

  if (isLoading)
    return <div className="p-8 text-center">Caricamento in corso...</div>;
  if (isError)
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Nessuna transazione trovata
          </h2>
          <p className="text-yellow-700 mb-4">
            Non hai ancora nessuna transazione. Aggiungi alcuni dati di esempio
            per iniziare!
          </p>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>Inserisci manualmente i dati nella dashboard Supabase</p>
          </div>
        </div>
      </div>
    );

  return (
    <main className="md:min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex-1 md:flex justify-between items-center">
          <div className="mb-3 md:mb-0">
            <h1 className="text-2xl text-center md:text-left font-bold text-slate-900">
              Dashboard Finanziaria
            </h1>
            <p className="text-slate-500 text-center md:text-left">
              Bentornato, ecco il riepilogo delle tue finanze.
            </p>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <PlusIcon size={20} />
              <span>Nuova Transazione</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Saldo Totale"
            value={`€${totalBalance.toFixed(2)}`}
            icon={<Wallet className="text-blue-600" />}
          />
          <StatCard
            title="Entrate"
            value={`+ €${totals.income.toFixed(2)}`}
            icon={<ArrowUpCircle className="text-green-600" />}
          />
          <StatCard
            title="Uscite"
            value={`- €${totals.expense.toFixed(2)}`}
            icon={<ArrowDownCircle className="text-red-600" />}
          />
          <StatCard
            title={
              lastMonthSavings !== 0
                ? "Risparmio Ultimo Mese"
                : "Risparmio Medio Mensile"
            }
            value={`€${(lastMonthSavings !== 0
              ? lastMonthSavings
              : monthlySavings
            ).toFixed(2)}`}
            icon={
              <TrendingUp
                className={
                  (lastMonthSavings !== 0
                    ? lastMonthSavings
                    : monthlySavings) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              />
            }
            subtitle={
              lastMonthSavings !== 0
                ? `Media: €${monthlySavings.toFixed(2)}`
                : "Basato su tutti i mesi"
            }
          />
        </div>

        {/* Main Content: Chart & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna Grafico (2/3 di spazio) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Andamento Temporale
            </h2>
            <BalanceChart data={transactions} />
          </div>

          {/* Colonna Ultime Transazioni (1/3 di spazio) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Ultime Attività
            </h2>
            <div
              className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden ${
                showAllTransactions ? "max-h-96 overflow-y-auto" : ""
              }`}
              suppressHydrationWarning
            >
              <div className="divide-y divide-slate-50">
                {transactions
                  .slice(0, showAllTransactions ? transactions.length : 5)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {t.category}
                        </p>
                        {t.description && (
                          <p className="text-sm text-slate-600 truncate max-w-[200px]">
                            {t.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          {new Date(t.date).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                      <span
                        className={`font-semibold ${
                          t.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"} €{t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
              {transactions.length > 5 && (
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="w-full py-3 text-sm text-blue-600 font-medium bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  {showAllTransactions ? "Mostra meno" : "Vedi tutte"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grafici a Torta per Categorie */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Analisi entrate e uscite
          </h2>
          <div className="grid grid-cols-1 pb-4">
            <CategoryPieChart data={transactions} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <SavingsCalculator />
          <MonthlyComparison transactions={transactions} />
          <AnnualProjection
            transactions={transactions}
            monthlySavings={monthlySavings}
          />
        </div>
      </div>
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

// Sotto-componente per le card delle statistiche (Clean Code: DRY principle)
function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
