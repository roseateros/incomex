export type TransactionType = 'income' | 'expense';
export type IncomeMethod = 'card' | 'cash' | 'app';
export type ExpenseCategory = 'general' | string;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  method?: IncomeMethod;
  category?: ExpenseCategory;
  date: string;
  note?: string;
}

export interface DailySummary {
  date: string;
  dayOfWeek: string;
  totalIncome: number;
  incomeByMethod: Record<IncomeMethod, number>;
  totalExpenses: number;
  expensesByMethod: Record<IncomeMethod, number>;
  netTotal: number;
  transactions: Transaction[];
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netTotal: number;
  incomeByMethod: Record<IncomeMethod, number>;
  expensesByMethod: Record<IncomeMethod, number>;
  dailySummaries: DailySummary[];
}

export interface YearlySummary {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netTotal: number;
  incomeByMethod: Record<IncomeMethod, number>;
  expensesByMethod: Record<IncomeMethod, number>;
  dailySummaries: DailySummary[];
}
