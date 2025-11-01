import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeftIcon, ArrowRightIcon, ChartIcon, DollarIcon } from '../components/Icons';
import { TableView } from '../components/TableView';
import { Toast } from '../components/Toast';
import { darkTheme, lightTheme } from '../theme/colors';
import { formatNumber } from '../utils/formatNumber';
import type { YearlySummary } from '../types';
import { transactionsService } from '../services/transactionsService';
import { useAwardPalette } from '../theme/awardPalette';
import { AwardBackground } from '../components/AwardBackground';

type ReportsScreenProps = {
  session: Session;
};

export const ReportsScreen = ({ session }: ReportsScreenProps) => {
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

  const [yearlySummary, setYearlySummary] = useState<YearlySummary | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>(
    { message: '', type: 'success', visible: false },
  );

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  }, []);

  const loadYearlySummary = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setIsLoading(true);
      }

      try {
        const data = await transactionsService.getYearlySummary(session.user.id, selectedYear);
        setYearlySummary(data);
      } catch (error) {
        console.error('Error al cargar resumen anual', error);
        setYearlySummary(null);
        showToast('No pudimos cargar el resumen anual.', 'error');
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [selectedYear, session.user.id, showToast],
  );

  useFocusEffect(
    useCallback(() => {
      void loadYearlySummary();
    }, [loadYearlySummary]),
  );

  const changeYear = (delta: number) => {
    setSelectedYear((prev) => prev + delta);
  };

  const monthlyData = yearlySummary?.dailySummaries.reduce((acc, day) => {
    const monthKey = format(new Date(day.date), 'MMM', { locale: es });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        card: 0,
        cash: 0,
        app: 0,
        total: 0,
        summary: 0,
      };
    }

    acc[monthKey].card += day.incomeByMethod.card;
    acc[monthKey].cash += day.incomeByMethod.cash;
    acc[monthKey].app += day.incomeByMethod.app;
    acc[monthKey].total += day.totalIncome;
    acc[monthKey].summary += day.totalExpenses;

    return acc;
  }, {} as Record<string, { month: string; card: number; cash: number; app: number; total: number; summary: number }>);

  const tableColumns = [
    { key: 'date', label: 'Mes', width: 2, align: 'left' as const, headerColor: palette.accent },
    { key: 'card', label: 'Tarjeta', width: 2, align: 'right' as const, headerColor: palette.accent },
    { key: 'cash', label: 'Efectivo', width: 2, align: 'right' as const, headerColor: palette.accent },
    { key: 'app', label: 'App T3', width: 2, align: 'right' as const, headerColor: palette.accent },
    { key: 'total', label: 'Total', width: 2, align: 'right' as const, headerColor: palette.accent, backgroundColor: palette.successBg },
    { key: 'summary', label: 'Gastos', width: 2, align: 'right' as const, headerColor: palette.accent, backgroundColor: palette.errorBg },
  ];

  const tableData = monthlyData
    ? Object.values(monthlyData).map((month) => ({
        date: month.month,
        card: formatNumber(month.card),
        cash: formatNumber(month.cash),
        app: formatNumber(month.app),
        total: formatNumber(month.total),
        summary: formatNumber(month.summary),
      }))
    : [];

  const totalRow = yearlySummary
    ? {
        date: 'Total',
        card: formatNumber(yearlySummary.incomeByMethod.card),
        cash: formatNumber(yearlySummary.incomeByMethod.cash),
        app: formatNumber(yearlySummary.incomeByMethod.app),
        total: formatNumber(yearlySummary.totalIncome),
        summary: formatNumber(yearlySummary.totalExpenses),
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

          <View style={[styles.yearSelector, { backgroundColor: 'transparent', borderColor: palette.borderSoft }]}>
            <TouchableOpacity onPress={() => changeYear(-1)}>
              <ArrowLeftIcon size={28} color={palette.text} />
            </TouchableOpacity>

            <View style={styles.yearInfo}>
              <ChartIcon size={28} color={palette.accent} />
              <Text style={[styles.yearText, { color: palette.text }]}>{selectedYear}</Text>
            </View>

            <TouchableOpacity onPress={() => changeYear(1)}>
              <ArrowRightIcon size={28} color={palette.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.totalCard, { backgroundColor: 'transparent', borderColor: palette.borderSoft }]}>
            <Text style={[styles.totalCardTitle, { color: palette.text }]}>Resumen Anual {selectedYear}</Text>
            <View style={styles.totalCardContent}>
              <View style={styles.totalRow}>
                <View style={styles.totalLabelContainer}>
                  <DollarIcon size={20} color={palette.positive} />
                  <Text style={[styles.totalLabel, { color: palette.text }]}>Total Ingresos:</Text>
                </View>
                <Text style={[styles.totalIncome, { color: palette.positive }]}>
                  {yearlySummary ? formatNumber(yearlySummary.totalIncome) : '0,00'} €
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
              <View style={styles.totalRow}>
                <View style={styles.totalLabelContainer}>
                  <DollarIcon size={20} color={palette.negative} />
                  <Text style={[styles.totalLabel, { color: palette.text }]}>Total Gastos:</Text>
                </View>
                <Text style={[styles.totalExpense, { color: palette.negative }]}>
                  {yearlySummary ? formatNumber(yearlySummary.totalExpenses) : '0,00'} €
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Desglose Mensual</Text>
            <TableView
              columns={tableColumns}
              data={tableData}
              showTotal
              totalRow={totalRow}
              emptyMessage="No hay datos para este año"
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  yearInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yearText: {
    fontSize: 28,
    fontWeight: '800',
  },
  totalCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  totalCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  totalCardContent: {
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalIncome: {
    fontSize: 20,
    fontWeight: '800',
  },
  totalExpense: {
    fontSize: 20,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});
