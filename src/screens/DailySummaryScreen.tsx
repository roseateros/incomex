import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  AppIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CashIcon,
  CreditCardIcon,
  TableIcon,
  TrendDownIcon,
  TrendUpIcon,
  WalletIcon,
} from '../components/Icons';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableView } from '../components/TableView';
import { Toast } from '../components/Toast';
import { darkTheme, lightTheme } from '../theme/colors';
import { formatNumber } from '../utils/formatNumber';
import type { DailySummary, Transaction } from '../types';
import { transactionsService } from '../services/transactionsService';

type DailySummaryScreenProps = {
  session: Session;
};

export const DailySummaryScreen = ({ session }: DailySummaryScreenProps) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; transaction: Transaction | null }>({
    visible: false,
    transaction: null,
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const loadSummary = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setIsLoading(true);
      }

      try {
        const data = await transactionsService.getDailySummary(session.user.id, selectedDate);
        setSummary(data);
      } catch (error) {
        console.error('Error al cargar resumen diario', error);
        setSummary(null);
        setToast({ visible: true, message: 'No pudimos cargar el resumen diario.', type: 'error' });
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [selectedDate, session.user.id],
  );

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [loadSummary]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadSummary(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadSummary]);

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeleteDialog({ visible: true, transaction });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.transaction) {
      return;
    }

    try {
      await transactionsService.deleteTransaction(session.user.id, deleteDialog.transaction.id);
      setDeleteDialog({ visible: false, transaction: null });
      await loadSummary();
      setToast({ visible: true, message: 'Transacción eliminada', type: 'success' });
    } catch (error) {
      console.error('Error al eliminar transacción', error);
      setToast({ visible: true, message: 'Error al eliminar', type: 'error' });
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = monthStart.getDay();

    return (
      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <View style={[styles.calendarContainer, { backgroundColor: theme.surface }]} onStartShouldSetResponder={() => true}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                <ArrowLeftIcon size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.calendarTitle, { color: theme.text }]}> {format(calendarMonth, 'MMMM yyyy', { locale: es })}</Text>
              <TouchableOpacity onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                <ArrowRightIcon size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayRow}>
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
                <Text key={index} style={[styles.weekdayText, { color: theme.textSecondary }]}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                <View key={`empty-${index}`} style={styles.dayCell} />
              ))}

              {days.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: theme.primary },
                      isToday && !isSelected && { borderWidth: 2, borderColor: theme.primary },
                    ]}
                    onPress={() => selectDate(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                        isToday && !isSelected && { color: theme.primary, fontWeight: '700' },
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const changeDay = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const tableColumns = [
    { key: 'date', label: 'Día', width: 2, align: 'left' as const, headerColor: '#90C695' },
    { key: 'card', label: 'Tarjeta', width: 2, align: 'right' as const, headerColor: '#90C695' },
    { key: 'cash', label: 'Efectivo', width: 2, align: 'right' as const, headerColor: '#90C695' },
    { key: 'app', label: 'App T3', width: 2, align: 'right' as const, headerColor: '#90C695' },
    { key: 'total', label: 'Total', width: 2, align: 'right' as const, headerColor: '#90C695', backgroundColor: '#E8F5E9' },
    { key: 'summary', label: 'Gastos', width: 2, align: 'right' as const, headerColor: '#90C695', backgroundColor: '#FFF9C4' },
  ];

  const tableData = summary
    ? [
        {
          date: `${format(selectedDate, 'd-MMMM', { locale: es })}\n${summary.dayOfWeek}`,
          card: summary.incomeByMethod.card > 0 ? formatNumber(summary.incomeByMethod.card) : '0',
          cash: summary.incomeByMethod.cash > 0 ? formatNumber(summary.incomeByMethod.cash) : '0',
          app: summary.incomeByMethod.app > 0 ? formatNumber(summary.incomeByMethod.app) : '0',
          total: formatNumber(summary.totalIncome),
          summary: summary.totalExpenses > 0 ? formatNumber(summary.totalExpenses) : '0',
          backgroundColor: '#FFFFFF',
        },
      ]
    : [];

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
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading && !refreshing ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : null}
        {renderCalendar()}

        <TouchableOpacity
          style={[styles.dateSelector, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => setShowCalendar(true)}
        >
          <CalendarIcon size={24} color={theme.primary} />
          <View style={styles.dateTextContainer}>
            <Text style={[styles.dateText, { color: theme.text }]}> {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}</Text>
            {summary?.dayOfWeek ? (
              <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: 14 }]}>{summary.dayOfWeek}</Text>
            ) : null}
          </View>
          <TableIcon size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Resumen del Día</Text>

        <TableView
          columns={tableColumns}
          data={tableData}
          showTotal
          totalRow={totalRow}
          emptyMessage="No hay transacciones registradas este día"
        />

        {summary && (summary.totalIncome > 0 || summary.totalExpenses > 0) ? (
          <View style={[styles.detailsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.detailsTitle, { color: theme.text }]}>Desglose Detallado</Text>

            <View style={styles.detailsBox}>
              <View style={styles.detailsRow}>
                <View style={styles.detailsLabelContainer}>
                  <CreditCardIcon size={18} color={theme.card} />
                  <Text style={[styles.detailsLabel, { color: theme.text }]}>Ingresos Tarjeta:</Text>
                </View>
                <Text style={[styles.detailsValueIncome, { color: theme.success }]}>
                  {formatNumber(summary.incomeByMethod.card)} €
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <View style={styles.detailsLabelContainer}>
                  <CashIcon size={18} color={theme.cash} />
                  <Text style={[styles.detailsLabel, { color: theme.text }]}>Ingresos Efectivo:</Text>
                </View>
                <Text style={[styles.detailsValueIncome, { color: theme.success }]}>
                  {formatNumber(summary.incomeByMethod.cash)} €
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <View style={styles.detailsLabelContainer}>
                  <AppIcon size={18} color={theme.app} />
                  <Text style={[styles.detailsLabel, { color: theme.text }]}>Ingresos App:</Text>
                </View>
                <Text style={[styles.detailsValueIncome, { color: theme.success }]}>
                  {formatNumber(summary.incomeByMethod.app)} €
                </Text>
              </View>
              <View style={[styles.detailsDivider, { backgroundColor: theme.border }]} />
              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabelBold, { color: theme.text }]}>Total Ingresos:</Text>
                <Text style={[styles.detailsValueIncomeBold, { color: theme.success }]}>
                  {formatNumber(summary.totalIncome)} €
                </Text>
              </View>
            </View>

            {summary.totalExpenses > 0 ? (
              <View style={[styles.detailsBox, { marginTop: 12 }]}> 
                <View style={styles.detailsRow}>
                  <View style={styles.detailsLabelContainer}>
                    <WalletIcon size={18} color={theme.error} />
                    <Text style={[styles.detailsLabel, { color: theme.text }]}>Gastos Varios:</Text>
                  </View>
                  <Text style={[styles.detailsValueExpense, { color: theme.error }]}>
                    {formatNumber(summary.totalExpenses)} €
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {summary && summary.transactions.length > 0 ? (
          <View style={[styles.transactionsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.detailsTitle, { color: theme.text }]}>Transacciones del Día</Text>
            {summary.transactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              const icon = transaction.method === 'card'
                ? <CreditCardIcon size={18} color={isIncome ? theme.card : theme.error} />
                : transaction.method === 'cash'
                ? <CashIcon size={18} color={isIncome ? theme.cash : theme.error} />
                : transaction.method === 'app'
                ? <AppIcon size={18} color={isIncome ? theme.app : theme.error} />
                : <WalletIcon size={18} color={theme.error} />;

              return (
                <View key={transaction.id} style={[styles.transactionItem, { borderColor: theme.border }]}> 
                  <View style={styles.transactionInfo}>
                    {icon}
                    <View style={styles.transactionDetails}>
                      <Text style={[styles.transactionType, { color: theme.text }]}>
                        {isIncome ? 'Ingreso' : 'Gasto'}{transaction.method ? ` - ${transaction.method.toUpperCase()}` : ''}
                      </Text>
                      <Text style={[styles.transactionAmount, { color: isIncome ? theme.success : theme.error }]}>
                        {formatNumber(transaction.amount)} €
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.error }]}
                      onPress={() => handleDeleteTransaction(transaction)}
                    >
                      <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Eliminar Transacción"
        message={
          deleteDialog.transaction
            ? `¿Seguro que quieres eliminar este ${deleteDialog.transaction.type === 'income' ? 'ingreso' : 'gasto'} de ${formatNumber(deleteDialog.transaction.amount)} €?`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ visible: false, transaction: null })}
        confirmColor={theme.error}
      />

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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  dateTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  detailsContainer: {
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailsBox: {
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailsLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  detailsLabelBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsValueIncome: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsValueIncomeBold: {
    fontSize: 18,
    fontWeight: '800',
  },
  detailsValueExpense: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsDivider: {
    height: 1,
    marginVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsContainer: {
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
