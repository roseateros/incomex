import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEntry, deleteEntry, fetchEntriesByDate, fetchEntriesInRange, updateEntry } from '@services/entries';
import { LedgerEntry, LedgerSource, UpsertLedgerEntry } from '@models/ledger';
import { SOURCE_DESCRIPTORS } from '@constants/sources';
import { monthRange, toISODate, yearRange } from '@utils/dates';

export interface EntryMarkers {
  [dateISO: string]: {
    total: number;
    hasExpense: boolean;
  };
}

export interface SourceAggregate {
  source: LedgerSource;
  label: string;
  total: number;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  incomeBySource: SourceAggregate[];
  expenseBySource: SourceAggregate[];
}

export function useEntriesForDate(dateISO: string) {
  return useQuery({
    queryKey: ['entries', 'day', dateISO],
    queryFn: () => fetchEntriesByDate(dateISO),
    enabled: Boolean(dateISO)
  });
}

export function useMonthlyMarkers(reference: Date) {
  const targetISO = toISODate(reference);
  const { start, end } = monthRange(reference);

  const query = useQuery({
    queryKey: ['entries', 'month-markers', targetISO],
    queryFn: () => fetchEntriesInRange(start, end)
  });

  const markers = useMemo<EntryMarkers>(() => {
    if (!query.data) {
      return {};
    }

    return query.data.reduce<EntryMarkers>((acc, entry) => {
      const base = acc[entry.entry_date] ?? { total: 0, hasExpense: false };
      return {
        ...acc,
        [entry.entry_date]: {
          total: base.total + entry.amount,
          hasExpense: base.hasExpense || entry.entry_type === 'expense'
        }
      };
    }, {});
  }, [query.data]);

  return {
    ...query,
    markers
  };
}

function aggregateBySource(entries: LedgerEntry[]): ReportSummary {
  const aggregates: Record<LedgerSource, { income: number; expense: number }> = {
    cash: { income: 0, expense: 0 },
    card: { income: 0, expense: 0 },
    app_t3: { income: 0, expense: 0 },
    expense: { income: 0, expense: 0 }
  };

  for (const entry of entries) {
    const record = aggregates[entry.source];
    if (entry.entry_type === 'income') {
      record.income += entry.amount;
    } else {
      record.expense += entry.amount;
    }
  }

  const incomeBySource: SourceAggregate[] = Object.entries(aggregates)
    .filter(([, value]) => value.income > 0)
    .map(([source, value]) => ({
      source: source as LedgerSource,
      label: SOURCE_DESCRIPTORS[source as LedgerSource].label,
      total: value.income
    }));

  const expenseBySource: SourceAggregate[] = Object.entries(aggregates)
    .filter(([, value]) => value.expense > 0)
    .map(([source, value]) => ({
      source: source as LedgerSource,
      label: SOURCE_DESCRIPTORS[source as LedgerSource].label,
      total: value.expense
    }));

  return {
    totalIncome: incomeBySource.reduce((sum, item) => sum + item.total, 0),
    totalExpense: expenseBySource.reduce((sum, item) => sum + item.total, 0),
    incomeBySource,
    expenseBySource
  };
}

export function useReportSummary(reference: Date, mode: 'month' | 'year') {
  const { start, end } = mode === 'month' ? monthRange(reference) : yearRange(reference);
  const target = mode === 'month' ? toISODate(reference) : reference.getFullYear().toString();

  const query = useQuery({
    queryKey: ['entries', 'summary', mode, target],
    queryFn: () => fetchEntriesInRange(start, end)
  });

  const summary = useMemo(() => (query.data ? aggregateBySource(query.data) : undefined), [query.data]);

  return {
    ...query,
    summary
  };
}

export function useEntryMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['entries'] });
  };

  const create = useMutation({
    mutationFn: (payload: UpsertLedgerEntry) => createEntry(payload),
    onSuccess: () => invalidate()
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertLedgerEntry }) => updateEntry(id, payload),
    onSuccess: () => invalidate()
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () => invalidate()
  });

  return {
    create,
    update,
    remove
  };
}
