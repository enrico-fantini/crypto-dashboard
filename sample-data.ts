// Dati di esempio per popolare il database Supabase
// Puoi copiare questi dati nella tua tabella "transactions" di Supabase

export const sampleTransactions = [
  {
    amount: 2500,
    category: "Stipendio",
    type: "income" as const,
    description: "Stipendio mensile",
    date: "2024-01-15T10:00:00Z",
  },
  {
    amount: 1200,
    category: "Freelance",
    type: "income" as const,
    description: "Progetto web completato",
    date: "2024-01-20T14:30:00Z",
  },
  {
    amount: 800,
    category: "Affitto",
    type: "expense" as const,
    description: "Affitto appartamento gennaio",
    date: "2024-01-01T09:00:00Z",
  },
  {
    amount: 150,
    category: "Spesa",
    type: "expense" as const,
    description: "Spesa settimanale supermercato",
    date: "2024-01-05T18:45:00Z",
  },
  {
    amount: 75,
    category: "Trasporti",
    type: "expense" as const,
    description: "Abbonamento mensile bus",
    date: "2024-01-08T08:15:00Z",
  },
  {
    amount: 200,
    category: "Ristorante",
    type: "expense" as const,
    description: "Cena romantica",
    date: "2024-01-12T20:00:00Z",
  },
  {
    amount: 3000,
    category: "Stipendio",
    type: "income" as const,
    description: "Stipendio mensile febbraio",
    date: "2024-02-15T10:00:00Z",
  },
  {
    amount: 950,
    category: "Affitto",
    type: "expense" as const,
    description: "Affitto appartamento febbraio",
    date: "2024-02-01T09:00:00Z",
  },
  {
    amount: 180,
    category: "Spesa",
    type: "expense" as const,
    description: "Spesa settimanale",
    date: "2024-02-05T19:20:00Z",
  },
  {
    amount: 65,
    category: "Trasporti",
    type: "expense" as const,
    description: "Biglietto treno",
    date: "2024-02-10T07:30:00Z",
  },
  {
    amount: 120,
    category: "Intrattenimento",
    type: "expense" as const,
    description: "Biglietto cinema",
    date: "2024-02-15T21:15:00Z",
  },
  {
    amount: 450,
    category: "Abbigliamento",
    type: "expense" as const,
    description: "Nuovo paio di scarpe",
    date: "2024-02-20T16:45:00Z",
  },
  {
    amount: 2800,
    category: "Stipendio",
    type: "income" as const,
    description: "Stipendio mensile marzo",
    date: "2024-03-15T10:00:00Z",
  },
  {
    amount: 1000,
    category: "Bonus",
    type: "income" as const,
    description: "Bonus produttività",
    date: "2024-03-01T11:30:00Z",
  },
  {
    amount: 850,
    category: "Affitto",
    type: "expense" as const,
    description: "Affitto appartamento marzo",
    date: "2024-03-01T09:00:00Z",
  },
  {
    amount: 200,
    category: "Spesa",
    type: "expense" as const,
    description: "Spesa settimanale",
    date: "2024-03-08T18:30:00Z",
  },
  {
    amount: 90,
    category: "Trasporti",
    type: "expense" as const,
    date: "2024-03-12T08:00:00Z",
  },
  {
    amount: 350,
    category: "Elettronica",
    type: "expense" as const,
    description: "Nuove cuffie wireless",
    date: "2024-03-18T15:20:00Z",
  },
];

// Script per inserire i dati nel database (da eseguire nella console del browser)
// Dopo esserti autenticato, puoi copiare e incollare questo codice nella console:

export const insertSampleData = async () => {
  const { supabase } = await import("./lib/supabase");

  try {
    // Ottieni l'utente corrente
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Errore: Utente non autenticato. Effettua il login prima.");
      return false;
    }

    // Aggiungi user_id a ogni transazione
    const transactionsWithUserId = sampleTransactions.map((transaction) => ({
      ...transaction,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionsWithUserId);

    if (error) {
      console.error("Errore nell'inserimento dei dati:", error);
      return false;
    }

    console.log("✅ Dati inseriti con successo!", data);
    console.log("🔄 Ricarica la pagina per vedere i tuoi dati.");
    return true;
  } catch (error) {
    console.error("Errore:", error);
    return false;
  }
};

// Per usare questo script nella console del browser:
// 1. Apri la console del browser (F12)
// 2. Copia e incolla questo codice:
// import('./sample-data.js').then(m => m.insertSampleData())
