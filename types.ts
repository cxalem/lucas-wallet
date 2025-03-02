export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastTransaction?: Transaction;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
}
