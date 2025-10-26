import { LedgerSource } from '@models/ledger';

export interface SourceDescriptor {
  id: LedgerSource;
  label: string;
  color: string;
  accent: string;
}

export const SOURCE_DESCRIPTORS: Record<LedgerSource, SourceDescriptor> = {
  cash: {
    id: 'cash',
    label: 'Efectivo',
    color: '#F59E0B',
    accent: '#FFEDD5'
  },
  card: {
    id: 'card',
    label: 'Tarjeta',
    color: '#2563EB',
    accent: '#DBEAFE'
  },
  app_t3: {
    id: 'app_t3',
    label: 'App T3',
    color: '#7C3AED',
    accent: '#EDE9FE'
  },
  expense: {
    id: 'expense',
    label: 'Gastos',
    color: '#DC2626',
    accent: '#FEE2E2'
  }
};

export const INCOME_SOURCES: LedgerSource[] = ['cash', 'card', 'app_t3'];
export const EXPENSE_SOURCES: LedgerSource[] = ['expense'];
