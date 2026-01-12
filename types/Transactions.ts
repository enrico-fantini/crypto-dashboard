export interface Transaction {
  id: string;
  user_id?: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  description?: string;
  date: string;
}
