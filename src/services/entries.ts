import { LedgerEntry, UpsertLedgerEntry } from '@models/ledger';
import { supabase } from './supabaseClient';

const TABLE_NAME = 'ledger_entries';

export async function fetchEntriesByDate(dateISO: string): Promise<LedgerEntry[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('entry_date', dateISO)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchEntriesInRange(startISO: string, endISO: string): Promise<LedgerEntry[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .gte('entry_date', startISO)
    .lte('entry_date', endISO)
    .order('entry_date', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createEntry(payload: UpsertLedgerEntry): Promise<LedgerEntry> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateEntry(id: string, payload: UpsertLedgerEntry): Promise<LedgerEntry> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}
