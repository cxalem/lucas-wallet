export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
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

export enum TransferStateEnum {
  Idle = "idle",
  Validating = "validating",
  Pending = "pending",
  Success = "success",
  Error = "error",
}
