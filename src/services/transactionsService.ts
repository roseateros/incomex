import { format, eachDayOfInterval, endOfDay, endOfMonth, endOfYear, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

import { supabase } from '../lib/supabase';
import type { DailySummary, IncomeMethod, MonthlySummary, Transaction, YearlySummary } from '../types/index';

const INCOME_METHODS: IncomeMethod[] = ['card', 'cash', 'app'];
const METHOD_SET = new Set<IncomeMethod>(INCOME_METHODS);

type RawEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  amount: number;
  category: string | null;
  note: string | null;
  created_at?: string | null;
};

type MethodTotals = Record<IncomeMethod, number>;

type Totals = {
  totalIncome: number;
  totalExpenses: number;
  incomeByMethod: MethodTotals;
  expensesByMethod: MethodTotals;
};

type CreateTransactionsPayload = {
  date: Date;
  card?: number;
  cash?: number;
  app?: number;
  expense?: number;
  note?: string | null;
};

type Range = {
  startDate: Date;
  endDate: Date;
};

function ensurePositive(value?: number) {
  return value && value > 0 ? value : 0;
}

function methodTotals(): MethodTotals {
  return {
    card: 0,
    cash: 0,
    app: 0,
  };
}

function normaliseToISO(date: string | null | undefined): string {
  if (!date) {
    return new Date().toISOString();
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function inferMethod(category: string | null, type: Transaction['type']): IncomeMethod | undefined {
  if (type !== 'income' || !category) {
    return undefined;
  }

  if (METHOD_SET.has(category as IncomeMethod)) {
    return category as IncomeMethod;
  }

  return undefined;
}

function mapEntryToTransaction(entry: RawEntry): Transaction {
  const amountNumber = Number(entry.amount) || 0;
  const type: Transaction['type'] = amountNumber >= 0 ? 'income' : 'expense';
  const method = inferMethod(entry.category, type);

  return {
    id: entry.id,
    type,
    amount: Math.abs(amountNumber),
    method,
    category: type === 'expense' ? entry.category ?? 'general' : undefined,
    date: normaliseToISO(entry.entry_date ?? entry.created_at ?? undefined),
    note: entry.note ?? undefined,
  };
}

function toTotals(transactions: Transaction[]): Totals {
  return transactions.reduce<Totals>(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
        if (transaction.method) {
          acc.incomeByMethod[transaction.method] += transaction.amount;
        }
      } else {
        acc.totalExpenses += transaction.amount;
        if (transaction.method) {
          acc.expensesByMethod[transaction.method] += transaction.amount;
        }
      }

      return acc;
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      incomeByMethod: methodTotals(),
      expensesByMethod: methodTotals(),
    },
  );
}

function buildDailySummary(date: Date, transactions: Transaction[]): DailySummary {
  const totals = toTotals(transactions);

  return {
    date: format(date, 'yyyy-MM-dd'),
    dayOfWeek: format(date, 'EEEE', { locale: es }),
    totalIncome: totals.totalIncome,
    incomeByMethod: totals.incomeByMethod,
    totalExpenses: totals.totalExpenses,
    expensesByMethod: totals.expensesByMethod,
    netTotal: totals.totalIncome - totals.totalExpenses,
    transactions: transactions.sort((a, b) => (a.date > b.date ? -1 : 1)),
  };
}

async function fetchTransactions(userId: string, range?: Range): Promise<Transaction[]> {
  let query = supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: true });

  if (range) {
    query = query
      .gte('entry_date', format(range.startDate, 'yyyy-MM-dd'))
      .lte('entry_date', format(range.endDate, 'yyyy-MM-dd'));
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const rows = (data as RawEntry[]) ?? [];
  return rows.map(mapEntryToTransaction);
}

export const transactionsService = {
  async createTransactions(userId: string, payload: CreateTransactionsPayload): Promise<Transaction[]> {
    const card = ensurePositive(payload.card);
    const cash = ensurePositive(payload.cash);
    const app = ensurePositive(payload.app);
    const expense = ensurePositive(payload.expense);

    const rows: Array<Omit<RawEntry, 'id'>> = [];
    const entryDate = format(payload.date, 'yyyy-MM-dd');

    if (card > 0) {
      rows.push({
        user_id: userId,
        entry_date: entryDate,
        amount: card,
        category: 'card',
        note: payload.note ?? null,
      });
    }

    if (cash > 0) {
      rows.push({
        user_id: userId,
        entry_date: entryDate,
        amount: cash,
        category: 'cash',
        note: payload.note ?? null,
      });
    }

    if (app > 0) {
      rows.push({
        user_id: userId,
        entry_date: entryDate,
        amount: app,
        category: 'app',
        note: payload.note ?? null,
      });
    }

    if (expense > 0) {
      rows.push({
        user_id: userId,
        entry_date: entryDate,
        amount: -expense,
        category: 'expense',
        note: payload.note ?? null,
      });
    }

    if (rows.length === 0) {
      return [];
    }

    const { data, error } = await supabase.from('entries').insert(rows).select();
    if (error) {
      throw error;
    }

    return ((data as RawEntry[]) ?? []).map(mapEntryToTransaction);
  },

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const { error } = await supabase.from('entries').delete().eq('user_id', userId).eq('id', transactionId);
    if (error) {
      throw error;
    }
  },

  async getDailySummary(userId: string, date: Date): Promise<DailySummary> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    const transactions = await fetchTransactions(userId, { startDate: start, endDate: end });
    return buildDailySummary(date, transactions);
  },

  async getMonthlySummary(userId: string, year: number, month: number): Promise<MonthlySummary> {
    const target = new Date(year, month - 1, 1);
    const start = startOfMonth(target);
    const end = endOfMonth(target);
    const transactions = await fetchTransactions(userId, { startDate: start, endDate: end });

    const grouped = new Map<string, Transaction[]>();
    transactions.forEach((transaction) => {
      const key = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(transaction);
    });

    const dailySummaries = eachDayOfInterval({ start, end }).map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const dayTransactions = grouped.get(key) ?? [];
      return buildDailySummary(day, dayTransactions);
    });

    const totals = dailySummaries.reduce<Totals>(
      (acc, summary) => {
        acc.totalIncome += summary.totalIncome;
        acc.totalExpenses += summary.totalExpenses;
        INCOME_METHODS.forEach((method) => {
          acc.incomeByMethod[method] += summary.incomeByMethod[method];
          acc.expensesByMethod[method] += summary.expensesByMethod[method];
        });
        return acc;
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        incomeByMethod: methodTotals(),
        expensesByMethod: methodTotals(),
      },
    );

    return {
      month,
      year,
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      netTotal: totals.totalIncome - totals.totalExpenses,
      incomeByMethod: totals.incomeByMethod,
      expensesByMethod: totals.expensesByMethod,
      dailySummaries,
    };
  },

  async getYearlySummary(userId: string, year: number): Promise<YearlySummary> {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 0, 1));
    const transactions = await fetchTransactions(userId, { startDate: start, endDate: end });

    const grouped = new Map<string, Transaction[]>();
    transactions.forEach((transaction) => {
      const key = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(transaction);
    });

    const dailySummaries = eachDayOfInterval({ start, end }).map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const dayTransactions = grouped.get(key) ?? [];
      return buildDailySummary(day, dayTransactions);
    });

    const totals = dailySummaries.reduce<Totals>(
      (acc, summary) => {
        acc.totalIncome += summary.totalIncome;
        acc.totalExpenses += summary.totalExpenses;
        INCOME_METHODS.forEach((method) => {
          acc.incomeByMethod[method] += summary.incomeByMethod[method];
          acc.expensesByMethod[method] += summary.expensesByMethod[method];
        });
        return acc;
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        incomeByMethod: methodTotals(),
        expensesByMethod: methodTotals(),
      },
    );

    return {
      year,
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      netTotal: totals.totalIncome - totals.totalExpenses,
      incomeByMethod: totals.incomeByMethod,
      expensesByMethod: totals.expensesByMethod,
      dailySummaries,
    };
  },

  async getAllTransactions(userId: string): Promise<Transaction[]> {
    return fetchTransactions(userId);
  },
};
