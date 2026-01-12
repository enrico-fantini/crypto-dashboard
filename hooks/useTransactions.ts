import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import { Transaction } from "@/types/Transactions";

export const useTransactions = () => {
  const queryClient = useQueryClient();

  // 1. Fetch delle transazioni
  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utente non autenticato");
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id) // Filtra per utente corrente
        .order("date", { ascending: false });

      if (error) throw new Error(error.message);
      return data as Transaction[];
    },
  });

  // 2. Mutation per aggiungere una transazione
  const addTransactionMutation = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, "id" | "user_id">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utente non autenticato");
      }

      const transactionWithUserId = {
        ...newTransaction,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert([transactionWithUserId]);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // Invalida la cache per forzare il refresh dei dati
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // 3. Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    transactions: transactionsQuery.data ?? [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    addTransaction: addTransactionMutation.mutate,
  };
};
