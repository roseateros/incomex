import { useCallback, useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { useAwardPalette } from '../theme/awardPalette';
import { AwardBackground } from '../components/AwardBackground';

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
  const palette = useAwardPalette();
  const tableTheme = useMemo(
    () => ({
      ...theme,
      surface: palette.surface,
      surfaceVariant: palette.surfaceStrong,
      text: palette.text,
      textSecondary: palette.subtext,
      primary: palette.accent,
      success: palette.positive,
      error: palette.negative,
      border: palette.border,
      tableHeader: palette.accentMuted,
      tableHeaderText: palette.text,
      tableRow: palette.surface,
      tableRowAlt: palette.surfaceStrong,
      tableBorder: palette.border,
      tableTotal: palette.successBg,
      tableHighlight: palette.highlight,
      tableSummary: palette.surfaceStrong,
    }),
    [palette, theme],
  );

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
        <View
          style={[styles.pickerContainer, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.yearHeader}>
            <TouchableOpacity onPress={() => setPickerYear((year) => year - 1)}>
              <ArrowLeftIcon size={28} color={palette.text} />
            </TouchableOpacity>
            <Text style={[styles.yearText, { color: palette.text }]}>{pickerYear}</Text>
            <TouchableOpacity onPress={() => setPickerYear((year) => year + 1)}>
              <ArrowRightIcon size={28} color={palette.text} />
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
                    { backgroundColor: palette.surfaceStrong, borderColor: palette.border },
                    isSelected && { backgroundColor: palette.accent },
                    isCurrent && !isSelected && { borderWidth: 2, borderColor: palette.accent },
                  ]}
                  onPress={() => selectMonthAndYear(monthNumber, pickerYear)}
                >
                  <Text
                    style={[
                      styles.monthText,
                      { color: isSelected ? '#FFFFFF' : palette.text },
                      isCurrent && !isSelected && { color: palette.accent, fontWeight: '700' },
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
    { key: 'date', label: 'Día', width: 2, align: 'left' as const, headerColor: palette.accent },
    { key: 'card', label: 'Tarjeta', width: 2, align: 'right' as const, headerColor: palette.accent },
    { key: 'cash', label: 'Efectivo', width: 2, align: 'right' as const, headerColor: palette.accent },
    { key: 'app', label: 'App T3', width: 2, align: 'right' as const, headerColor: palette.accent },
    { key: 'total', label: 'Total', width: 2, align: 'right' as const, headerColor: palette.accent, backgroundColor: palette.successBg },
    { key: 'summary', label: 'Gastos', width: 2, align: 'right' as const, headerColor: palette.accent, backgroundColor: palette.errorBg },
  ];

  const tableData = daysWithActivity.map((day) => ({
    date: `${format(new Date(day.date), 'd-MMMM', { locale: es })}\n${day.dayOfWeek}`,
    card: day.incomeByMethod.card > 0 ? formatNumber(day.incomeByMethod.card) : '0',
    cash: day.incomeByMethod.cash > 0 ? formatNumber(day.incomeByMethod.cash) : '0',
    app: day.incomeByMethod.app > 0 ? formatNumber(day.incomeByMethod.app) : '0',
    total: formatNumber(day.totalIncome),
    summary: day.totalExpenses > 0 ? formatNumber(day.totalExpenses) : '0',
    backgroundColor: palette.surface,
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
    <AwardBackground>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={palette.accent} />
            </View>
          ) : null}

          {renderMonthPicker()}

          <TouchableOpacity
            style={[styles.header, { backgroundColor: 'transparent', borderColor: palette.borderSoft }]}
            onPress={() => {
              setPickerYear(selectedYear);
              setShowMonthPicker(true);
            }}
            activeOpacity={0.85}
          >
            <CalendarIcon size={28} color={palette.accent} />
            <Text style={[styles.title, { color: palette.text }]}>{monthName}</Text>
            <ChartIcon size={28} color={palette.accent} />
          </TouchableOpacity>

          <View style={[styles.summaryBox, { backgroundColor: 'transparent', borderColor: palette.borderSoft }]}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: palette.subtext }]}>Total Ingresos</Text>
                <Text style={[styles.summaryValueIncome, { color: palette.positive }]}>
                  {summary ? formatNumber(summary.totalIncome) : '0,00'} €
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: palette.subtext }]}>Total Gastos</Text>
                <Text style={[styles.summaryValueExpense, { color: palette.negative }]}>
                  {summary ? formatNumber(summary.totalExpenses) : '0,00'} €
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Registro Mensual ({daysWithActivity.length} días)</Text>
            <TableView
              columns={tableColumns}
              data={tableData}
              showTotal
              totalRow={totalRow}
              emptyMessage="No hay transacciones este mes"
              theme={tableTheme}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </AwardBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
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
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    marginTop: 8,
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
    borderRadius: 12,
    padding: 18,
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
    marginBottom: 24,
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
    borderWidth: 1,
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
    borderWidth: 1,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});
