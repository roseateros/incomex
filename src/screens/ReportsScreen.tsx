import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VictoryPie } from 'victory-native';
import { AnimatedStatCard } from '@components/AnimatedStatCard';
import { EmptyState } from '@components/EmptyState';
import { SegmentedControl } from '@components/SegmentedControl';
import { SourceBreakdownList } from '@components/SourceBreakdownList';
import { useReportSummary } from '@hooks/useEntries';
import { SOURCE_DESCRIPTORS } from '@constants/sources';
import { formatCurrency } from '@utils/format';
import { formatMonthYearLabel, stepMonth, stepYear } from '@utils/dates';
import { palette, theme } from '@theme/colors';

const segmentOptions = [
  { value: 'month' as const, label: 'Mensual' },
  { value: 'year' as const, label: 'Anual' }
];

export function ReportsScreen() {
  interface ChartDatum {
    x: string;
    y: number;
    color: string;
  }

  const [mode, setMode] = useState<'month' | 'year'>('month');
  const [referenceDate, setReferenceDate] = useState(new Date());

  const summaryQuery = useReportSummary(referenceDate, mode);
  const summary = summaryQuery.summary;

  const periodLabel = useMemo(() => {
    return mode === 'month' ? formatMonthYearLabel(referenceDate) : referenceDate.getFullYear().toString();
  }, [mode, referenceDate]);

  function shift(step: number) {
    setReferenceDate((prev) => (mode === 'month' ? stepMonth(prev, step) : stepYear(prev, step)));
  }

  const incomeChartData = useMemo<ChartDatum[] | null>(() => {
    if (!summary || summary.totalIncome === 0) {
      return null;
    }
    return summary.incomeBySource.map((item) => ({
      x: `${item.label}\n${formatCurrency(item.total)}`,
      y: item.total,
      color: SOURCE_DESCRIPTORS[item.source].color
    }));
  }, [summary]);

  const expenseChartData = useMemo<ChartDatum[] | null>(() => {
    if (!summary || summary.totalExpense === 0) {
      return null;
    }
    return summary.expenseBySource.map((item) => ({
      x: `${item.label}\n${formatCurrency(item.total)}`,
      y: item.total,
      color: SOURCE_DESCRIPTORS[item.source].color
    }));
  }, [summary]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => shift(-1)} hitSlop={16}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={palette.textPrimary} />
          </Pressable>
          <View>
            <Text style={styles.heading}>Reportes</Text>
            <Text style={styles.subtitle}>{periodLabel}</Text>
          </View>
          <Pressable onPress={() => shift(1)} hitSlop={16}>
            <MaterialCommunityIcons name="chevron-right" size={28} color={palette.textPrimary} />
          </Pressable>
        </View>

        <SegmentedControl options={segmentOptions} value={mode} onChange={setMode} />

        {summaryQuery.isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={palette.primary} />
          </View>
        ) : !summary ? (
          <EmptyState
            icon="chart-timeline-variant"
            title="Sin datos"
            subtitle="Agrega movimientos para ver reportes."
          />
        ) : (
          <View style={styles.section}>
            <AnimatedStatCard
              title="Ingresos acumulados"
              value={summary.totalIncome}
              colors={[palette.primary, palette.primaryAlt]}
            />
            <AnimatedStatCard
              title="Gastos acumulados"
              value={summary.totalExpense}
              colors={[palette.danger, '#b91c1c']}
            />

            {incomeChartData ? (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Ingresos por fuente</Text>
                <VictoryPie
                  data={incomeChartData}
                  colorScale={incomeChartData.map((item) => item.color)}
                  innerRadius={60}
                  padAngle={2}
                  animate={{ duration: 700 }}
                  labels={({ datum }: { datum: ChartDatum }) => datum.x}
                  style={{
                    labels: {
                      fill: '#ffffff',
                      fontSize: 12
                    }
                  }}
                />
                <SourceBreakdownList data={summary.incomeBySource} total={summary.totalIncome} />
              </View>
            ) : null}

            {expenseChartData ? (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Gastos por fuente</Text>
                <VictoryPie
                  data={expenseChartData}
                  colorScale={expenseChartData.map((item) => item.color)}
                  innerRadius={60}
                  padAngle={2}
                  animate={{ duration: 700 }}
                  labels={({ datum }: { datum: ChartDatum }) => datum.x}
                  style={{
                    labels: {
                      fill: '#ffffff',
                      fontSize: 12
                    }
                  }}
                />
                <SourceBreakdownList data={summary.expenseBySource} total={summary.totalExpense} />
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  heading: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700'
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 14
  },
  loader: {
    paddingVertical: theme.spacing.xl
  },
  section: {
    gap: theme.spacing.lg
  },
  chartCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md
  },
  chartTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700'
  }
});
