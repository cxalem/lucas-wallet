export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  wallet_address: string;
  lastTransaction?: Transaction;
  avatarUrl?: string;
}

export interface Contact {
  id: string;
  contact_name: string;
  contact_last_name: string;
  contact_email: string;
  phone_number?: string;
  wallet_address: string;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
}

export enum TransferStateEnum {
  Idle = "idle",
  Validating = "validating",
  Pending = "pending",
  Success = "success",
  Error = "error",
}
