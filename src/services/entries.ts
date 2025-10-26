import { supabase } from '../lib/supabase';
import type { Entry, EntryDraft } from '../types/entry';

export async function fetchEntries(userId: string) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Entry[];
}

export async function createEntry(userId: string, draft: EntryDraft) {
  const payload = {
    ...draft,
    note: draft.note ?? null,
    user_id: userId,
  };

  const { data, error } = await supabase.from('entries').insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data as Entry;
}
