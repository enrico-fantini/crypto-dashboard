# Configurazione Dashboard Finanziaria

## Prerequisiti

- Node.js 18+
- Account Supabase (gratuito)

## Passo 1: Configurazione Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account gratuito
2. Crea un nuovo progetto
3. Nella dashboard del progetto, vai su **Settings > API**
4. Copia l'**URL del progetto** e la **chiave anonima**

## Passo 2: Configurazione Ambiente Locale

1. Crea il file `.env.local` nella root del progetto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Sostituisci i valori con quelli copiati da Supabase

## Passo 3: Creazione Database

Il database è già stato creato correttamente! Le tue tabelle sono:

- **`profiles`**: Estensione degli utenti di autenticazione
- **`transactions`**: Transazioni finanziarie con sicurezza RLS abilitata

Le policies RLS assicurano che ogni utente possa vedere/modificare solo le proprie transazioni.

## Passo 4: Test dell'Applicazione

1. **Avvia l'applicazione**:

   ```bash
   npm run dev
   ```

2. **Registrati/Crea un account** usando l'interfaccia di autenticazione

3. **Inserisci dati di esempio** aprendo la console del browser (F12) e incollando:

   ```javascript
   import("./sample-data.js").then((m) => m.insertSampleData());
   ```

   I dati verranno automaticamente associati al tuo account grazie all'autenticazione.

## Inserimento Manuale dei Dati

Se preferisci inserire i dati manualmente nella dashboard Supabase:

1. Vai su **Table Editor > transactions**
2. Inserisci i dati dal file `sample-data.ts`
3. Assicurati di includere il campo `user_id` con il tuo ID utente

**Nota**: Grazie alla Row Level Security (RLS), ogni utente può vedere/modificare solo le proprie transazioni.

## Risoluzione Problemi

### Errore "Failed to fetch" durante registrazione

Questo errore indica problemi di configurazione:

1. **Credenziali mancanti**: Assicurati che il file `.env.local` contenga URL e chiave API validi di Supabase
2. **URL placeholder**: Non usare `https://your-project-id.supabase.co` - usa il tuo URL reale
3. **Chiave API**: Verifica che `NEXT_PUBLIC_SUPABASE_ANON_KEY` sia corretta

### Errore "Configurazione Supabase mancante"

- Crea il file `.env.local` nella root del progetto
- Aggiungi le credenziali reali dal dashboard Supabase

### Problemi con le Policy RLS

Se le credenziali sono corrette ma la registrazione fallisce:

1. Vai su **Supabase Dashboard > Authentication > Policies**
2. Verifica che ci siano policy per permettere `INSERT` su `auth.users`
3. Controlla che le tue policy personalizzate non blocchino la registrazione

### Test delle Credenziali

Per verificare che tutto funzioni:

1. Apri la console del browser (F12)
2. Incolla: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
3. Dovresti vedere il tuo URL Supabase reale, non un placeholder

## Passo 5: Avvio Applicazione

```bash
npm install
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## Abilita Real-time (Opzionale)

Per abilitare gli aggiornamenti real-time delle transazioni:

1. Nella dashboard Supabase, vai su **Database > Replication**
2. Abilita la replica per la tabella `transactions`
3. L'app aggiornerà automaticamente quando aggiungi/modifichi transazioni

## Risoluzione Problemi

- **Errore "Invalid supabaseUrl"**: Verifica che `.env.local` contenga URL e chiave corretti
- **Tabella non trovata**: Assicurati di aver creato la tabella `transactions`
- **Nessun dato**: Inserisci i dati di esempio usando lo script SQL sopra

## Struttura Database

La tabella `transactions` ha questa struttura:

```sql
id: UUID (Primary Key, auto-generated)
amount: DECIMAL(10,2) - Importo della transazione
category: VARCHAR(100) - Categoria (es. "Stipendio", "Affitto")
type: VARCHAR(20) - Tipo ("income" o "expense")
date: DATE - Data della transazione
created_at: TIMESTAMP - Timestamp di creazione (auto)
```

## Creazione Automatica Profili

Per creare automaticamente un profilo quando un utente si registra, esegui questo SQL nel **SQL Editor** di Supabase:

```sql
-- Trigger per creare automaticamente il profilo utente
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, updated_at)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url', now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger che si attiva quando un utente si registra
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Nota**: Questo trigger creerà automaticamente un profilo nella tabella `profiles` ogni volta che un nuovo utente si registra.
