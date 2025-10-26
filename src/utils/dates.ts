import { addMonths, addYears, endOfMonth, endOfYear, format, parseISO, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromISODate(dateISO: string): Date {
  return startOfDay(parseISO(dateISO));
}

export function formatDisplayDate(dateISO: string): string {
  return format(parseISO(dateISO), "EEEE d 'de' MMMM", { locale: es });
}

export function formatMonthYearLabel(reference: Date): string {
  return format(reference, "MMMM yyyy", { locale: es });
}

export function monthRange(reference: Date): { start: string; end: string } {
  return {
    start: format(startOfMonth(reference), 'yyyy-MM-dd'),
    end: format(endOfMonth(reference), 'yyyy-MM-dd')
  };
}

export function yearRange(reference: Date): { start: string; end: string } {
  return {
    start: format(startOfYear(reference), 'yyyy-MM-dd'),
    end: format(endOfYear(reference), 'yyyy-MM-dd')
  };
}

export function stepMonth(reference: Date, step: number): Date {
  return addMonths(reference, step);
}

export function stepYear(reference: Date, step: number): Date {
  return addYears(reference, step);
}
