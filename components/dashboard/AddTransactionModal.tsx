"use client";

import { useState } from "react";
import { Transaction } from "@/types/Transactions";
import { supabase } from "@/lib/supabase";
interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionModal({
  isOpen,
  onClose,
}: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
    description: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funzione interna per aggiungere la transazione (sostituisce il hook esterno per stabilità)
  const performAddTransaction = async (
    data: Omit<Transaction, "id" | "user_id">
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utente non autenticato");

    const { error } = await supabase.from("transactions").insert([
      {
        ...data,
        user_id: user.id,
      },
    ]);

    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.amount || !formData.category) {
        throw new Error("Importo e categoria sono obbligatori");
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("L'importo deve essere un numero positivo");
      }

      const baseDate = new Date(formData.date);

      if (formData.isRecurring) {
        // Logica Ricorrente: Crea 12 transazioni
        const promises = [];

        for (let i = 0; i < 12; i++) {
          const recurringDate = new Date(baseDate);
          recurringDate.setMonth(baseDate.getMonth() + i);

          // Correzione overflow mesi (es. 31 marzo -> 30 aprile)
          if (recurringDate.getDate() !== baseDate.getDate()) {
            recurringDate.setDate(0);
          }

          promises.push(
            performAddTransaction({
              amount,
              category: formData.category,
              type: formData.type,
              description:
                i === 0
                  ? formData.description
                  : `${formData.description || ""} (Ricorrente ${
                      i + 1
                    }/12)`.trim(),
              date: recurringDate.toISOString(),
            })
          );
        }

        await Promise.all(promises);
      } else {
        // Transazione Singola
        await performAddTransaction({
          amount,
          category: formData.category,
          type: formData.type,
          description: formData.description || undefined,
          date: baseDate.toISOString(),
        });
      }

      // Reset form e chiusura
      setFormData({
        amount: "",
        category: "",
        type: "expense",
        description: "",
        date: new Date().toISOString().split("T")[0],
        isRecurring: false,
      });
      onClose();

      window.location.reload();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Errore sconosciuto";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Nuova Operazione
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors text-3xl"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "expense" })}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  formData.type === "expense"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Uscita
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "income" })}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  formData.type === "income"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Entrata
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Importo (€)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Data
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Categoria
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="es. Affitto, Supermercato..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                required
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="isRecurring"
                className="text-sm font-semibold text-blue-900 cursor-pointer"
              >
                Ripeti ogni mese per un anno
                <span className="block text-[10px] text-blue-600 font-normal uppercase mt-0.5">
                  Verranno create 12 transazioni
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Note
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Aggiungi una nota..."
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900"
              />
            </div>

            {error && (
              <div className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {loading ? "Caricamento..." : "Aggiungi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
