import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  useColorScheme,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ChartIcon,
} from '../components/Icons';
import { TableView } from '../components/TableView';
import { Toast } from '../components/Toast';
import { darkTheme, lightTheme } from '../theme/colors';
import { formatNumber } from '../utils/formatNumber';
import type { MonthlySummary } from '../types';
import { transactionsService } from '../services/transactionsService';

type MonthlySummaryScreenProps = {
  session: Session;
};

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const MonthlySummaryScreen = ({ session }: MonthlySummaryScreenProps) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const loadSummary = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setIsLoading(true);
      }

      try {
        const data = await transactionsService.getMonthlySummary(session.user.id, selectedYear, selectedMonth);
        setSummary(data);
      } catch (error) {
        console.error('Error al cargar resumen mensual', error);
        setSummary(null);
        setToast({ visible: true, message: 'No pudimos cargar el resumen mensual.', type: 'error' });
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [selectedMonth, selectedYear, session.user.id],
  );

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [loadSummary]),
  );

  const changeMonth = (delta: number) => {
    let month = selectedMonth + delta;
    let year = selectedYear;

    if (month > 12) {
      month = 1;
      year += 1;
    } else if (month < 1) {
      month = 12;
      year -= 1;
    }

    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const selectMonthAndYear = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowMonthPicker(false);
  };

  const renderMonthPicker = () => (
    <Modal
      visible={showMonthPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMonthPicker(false)}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMonthPicker(false)}>
        <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]} onStartShouldSetResponder={() => true}>
          <View style={styles.yearHeader}>
            <TouchableOpacity onPress={() => setPickerYear((year) => year - 1)}>
              <ArrowLeftIcon size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.yearText, { color: theme.text }]}>{pickerYear}</Text>
            <TouchableOpacity onPress={() => setPickerYear((year) => year + 1)}>
              <ArrowRightIcon size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.monthGrid}>
            {MONTH_NAMES.map((monthName, index) => {
              const monthNumber = index + 1;
              const isSelected = selectedMonth === monthNumber && selectedYear === pickerYear;
              const now = new Date();
              const isCurrent = now.getMonth() === index && now.getFullYear() === pickerYear;

              return (
                <TouchableOpacity
                  key={monthName}
                  style={[
                    styles.monthCell,
                    { backgroundColor: theme.surfaceVariant },
                    isSelected && { backgroundColor: theme.primary },
                    isCurrent && !isSelected && { borderWidth: 2, borderColor: theme.primary },
                  ]}
                  onPress={() => selectMonthAndYear(monthNumber, pickerYear)}
                >
                  <Text
                    style={[
                      styles.monthText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                      isCurrent && !isSelected && { color: theme.primary, fontWeight: '700' },
                    ]}
                  >
                    {monthName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const monthName = format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM yyyy', { locale: es });

  const daysWithActivity = summary?.dailySummaries.filter((day) => day.totalIncome > 0 || day.totalExpenses > 0) ?? [];

  const tableColumns = [
    { key: 'date', label: 'Día', width: 2, align: 'left' as const, headerColor: '#90C695' },
    { key: 'card', label: 'Tarjeta', width: 2, align: 'right' as const, headerColor: '#90C695' },
    { key: 'cash', label: 'Efectivo', width: 2, align: 'right' as const, headerColor: '#90C695' },
    { key: 'app', label: 'App T3', width: 2, align: 'right' as const, headerColor: '#90C695' },
    { key: 'total', label: 'Total', width: 2, align: 'right' as const, headerColor: '#90C695', backgroundColor: '#E8F5E9' },
    { key: 'summary', label: 'Gastos', width: 2, align: 'right' as const, headerColor: '#90C695', backgroundColor: '#FFF9C4' },
  ];

  const tableData = daysWithActivity.map((day) => ({
    date: `${format(new Date(day.date), 'd-MMMM', { locale: es })}\n${day.dayOfWeek}`,
    card: day.incomeByMethod.card > 0 ? formatNumber(day.incomeByMethod.card) : '0',
    cash: day.incomeByMethod.cash > 0 ? formatNumber(day.incomeByMethod.cash) : '0',
    app: day.incomeByMethod.app > 0 ? formatNumber(day.incomeByMethod.app) : '0',
    total: formatNumber(day.totalIncome),
    summary: day.totalExpenses > 0 ? formatNumber(day.totalExpenses) : '0',
    backgroundColor: '#FFFFFF',
  }));

  const totalRow = summary
    ? {
        date: 'Total',
        card: formatNumber(summary.incomeByMethod.card),
        cash: formatNumber(summary.incomeByMethod.cash),
        app: formatNumber(summary.incomeByMethod.app),
        total: formatNumber(summary.totalIncome),
        summary: formatNumber(summary.totalExpenses),
      }
    : {
        date: 'Total',
        card: '0',
        cash: '0',
        app: '0',
        total: '0',
        summary: '0',
      };

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        {isLoading ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : null}
      {renderMonthPicker()}

      <TouchableOpacity
        style={[styles.header, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => {
          setPickerYear(selectedYear);
          setShowMonthPicker(true);
        }}
      >
        <CalendarIcon size={28} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>{monthName}</Text>
        <ChartIcon size={28} color={theme.primary} />
      </TouchableOpacity>

      <View style={[styles.summaryBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.text }]}>Total Ingresos</Text>
            <Text style={[styles.summaryValueIncome, { color: theme.success }]}>
              {summary ? formatNumber(summary.totalIncome) : '0,00'} €
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.text }]}>Total Gastos</Text>
            <Text style={[styles.summaryValueExpense, { color: theme.error }]}>
              {summary ? formatNumber(summary.totalExpenses) : '0,00'} €
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Registro Mensual ({daysWithActivity.length} días)</Text>
        <TableView
          columns={tableColumns}
          data={tableData}
          showTotal
          totalRow={totalRow}
          emptyMessage="No hay transacciones este mes"
        />
      </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'capitalize',
    flex: 1,
    textAlign: 'center',
  },
  summaryBox: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  summaryValueIncome: {
    fontSize: 28,
    fontWeight: '800',
  },
  summaryValueExpense: {
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '90%',
    maxWidth: 450,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthCell: {
    width: '30%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
