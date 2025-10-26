export type Entry = {
  id: string;
  user_id: string;
  entry_date: string;
  category: string | null;
  amount: number;
  note: string | null;
  created_at?: string;
};

export type EntryDraft = {
  entry_date: string;
  category: string;
  amount: number;
  note?: string | null;
};
