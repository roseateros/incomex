import { useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedStatCard } from '@components/AnimatedStatCard';
import { EntryCard } from '@components/EntryCard';
import { EntryFormModal } from '@components/EntryFormModal';
import { EmptyState } from '@components/EmptyState';
import { FloatingActionButton } from '@components/FloatingActionButton';
import { useEntriesForDate, useEntryMutations, useMonthlyMarkers } from '@hooks/useEntries';
import { LedgerEntry } from '@models/ledger';
import { formatDisplayDate, fromISODate, stepMonth, toISODate, todayISO } from '@utils/dates';
import { formatCurrency } from '@utils/format';
import { impactLight, notifySuccess } from '@utils/haptics';
import { palette, theme } from '@theme/colors';

LocaleConfig.locales.es = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export function DailyScreen() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [focusedMonth, setFocusedMonth] = useState(fromISODate(selectedDate));
  const [modalVisible, setModalVisible] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<LedgerEntry | undefined>(undefined);

  const entriesQuery = useEntriesForDate(selectedDate);
  const markersQuery = useMonthlyMarkers(focusedMonth);
  const { create, update, remove } = useEntryMutations();

  const dailyTotals = useMemo(() => {
    const entries = entriesQuery.data ?? [];
    return entries.reduce(
      (acc, entry) => {
        if (entry.entry_type === 'income') {
          acc.income += entry.amount;
        } else {
          acc.expense += entry.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [entriesQuery.data]);

  type CustomMarkedDates = Record<string, { customStyles: { container?: ViewStyle; text?: TextStyle } }>;

  const markedDates = useMemo<CustomMarkedDates>(() => {
    const markers = markersQuery.markers;
    const config: CustomMarkedDates = {};

    Object.entries(markers).forEach(([date, marker]) => {
      const isSelected = date === selectedDate;
      const baseColor = marker.hasExpense ? palette.danger : palette.primaryAlt;
      config[date] = {
        customStyles: {
          container: {
            backgroundColor: isSelected ? palette.primary : baseColor,
            borderRadius: 12
          },
          text: {
            color: '#ffffff',
            fontWeight: (isSelected ? '700' : '600') as TextStyle['fontWeight']
          }
        }
      };
    });

    if (!config[selectedDate]) {
      config[selectedDate] = {
        customStyles: {
          container: {
            backgroundColor: palette.primary,
            borderRadius: 12
          },
          text: {
            color: '#ffffff',
            fontWeight: '700'
          }
        }
      };
    }

    return config;
  }, [markersQuery.markers, selectedDate]);

  const entries = entriesQuery.data ?? [];

  async function handleCreate(payload: Parameters<typeof create.mutateAsync>[0]) {
    try {
      await create.mutateAsync(payload);
      notifySuccess();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el movimiento. Intenta de nuevo.');
      console.error(error);
    }
  }

  async function handleUpdate(payload: Parameters<typeof update.mutateAsync>[0]['payload'], id?: string) {
    if (!id) {
      return;
    }
    try {
      await update.mutateAsync({ id, payload });
      notifySuccess();
      setModalVisible(false);
      setEntryToEdit(undefined);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el movimiento.');
      console.error(error);
    }
  }

  function handleSubmit(payload: Parameters<typeof create.mutateAsync>[0], id?: string) {
    if (id) {
      void handleUpdate(payload, id);
    } else {
      void handleCreate(payload);
    }
  }

  function openCreate() {
    impactLight();
    setEntryToEdit(undefined);
    setModalVisible(true);
  }

  function openEdit(entry: LedgerEntry) {
    impactLight();
    setEntryToEdit(entry);
    setModalVisible(true);
  }

  function handleDelete(entry: LedgerEntry) {
    Alert.alert('Eliminar movimiento', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove.mutateAsync(entry.id);
            notifySuccess();
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar.');
            console.error(error);
          }
        }
      }
    ]);
  }

  function renderItem({ item }: { item: LedgerEntry }) {
    return <EntryCard entry={item} onEdit={openEdit} onDelete={handleDelete} />;
  }

  function handleMonthChange(day: DateData) {
    const next = new Date(day.dateString);
    setFocusedMonth(next);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Resumen diario</Text>
        <Text style={styles.subheading}>{formatDisplayDate(selectedDate)}</Text>

        <View style={styles.statsRow}>
          <AnimatedStatCard
            title="Ingresos"
            value={dailyTotals.income}
            colors={[palette.primaryAlt, palette.primary]}
            footer={
              <View style={styles.statFooter}>
                <MaterialCommunityIcons name="cash" size={18} color={palette.textSecondary} />
                <Text style={styles.statFooterText}>{formatCurrency(dailyTotals.income)}</Text>
              </View>
            }
          />
          <AnimatedStatCard
            title="Gastos"
            value={dailyTotals.expense}
            colors={[palette.danger, '#b91c1c']}
            footer={
              <View style={styles.statFooter}>
                <MaterialCommunityIcons name="receipt" size={18} color={palette.textSecondary} />
                <Text style={styles.statFooterText}>{formatCurrency(dailyTotals.expense)}</Text>
              </View>
            }
          />
        </View>

        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            markedDates={markedDates}
            markingType="custom"
            onDayPress={(day) => {
              impactLight();
              setSelectedDate(day.dateString);
              setFocusedMonth(new Date(day.dateString));
            }}
            onMonthChange={handleMonthChange}
            theme={{
              calendarBackground: palette.surface,
              dayTextColor: palette.textPrimary,
              textDisabledColor: palette.textSecondary,
              monthTextColor: palette.textPrimary,
              arrowColor: palette.primary,
              textSectionTitleColor: palette.textSecondary
            }}
            firstDay={1}
          />
        </View>

        <Text style={styles.sectionTitle}>Movimientos</Text>

        {entriesQuery.isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={palette.primary} />
          </View>
        ) : entries.length === 0 ? (
          <EmptyState
            icon="tray"
            title="Sin movimientos"
            subtitle="Agrega ingresos o gastos para verlos aquí."
          />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FloatingActionButton onPress={openCreate} />

      <EntryFormModal
        visible={modalVisible}
        entry={entryToEdit}
        onDismiss={() => {
          setModalVisible(false);
          setEntryToEdit(undefined);
        }}
        onSubmit={handleSubmit}
        isSubmitting={create.isPending || update.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md
  },
  heading: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '700'
  },
  subheading: {
    color: palette.textSecondary,
    marginBottom: theme.spacing.lg
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statFooterText: {
    color: palette.textSecondary,
    fontWeight: '600'
  },
  calendarCard: {
    marginVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.md
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl
  }
});
