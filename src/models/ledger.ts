export type LedgerSource = 'cash' | 'card' | 'app_t3' | 'expense';
export type LedgerEntryType = 'income' | 'expense';

export interface LedgerEntry {
  id: string;
  amount: number;
  entry_date: string;
  entry_type: LedgerEntryType;
  source: LedgerSource;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertLedgerEntry {
  amount: number;
  entry_date: string;
  entry_type: LedgerEntryType;
  source: LedgerSource;
  note?: string;
}
