import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LedgerEntry } from '@models/ledger';
import { INCOME_SOURCES, SOURCE_DESCRIPTORS } from '@constants/sources';
import { SegmentedControl } from './SegmentedControl';
import { formatCurrency } from '@utils/format';
import { fromISODate, toISODate } from '@utils/dates';
import { impactLight } from '@utils/haptics';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { palette, theme } from '@theme/colors';

interface EntryFormModalProps {
  visible: boolean;
  entry?: LedgerEntry;
  onDismiss: () => void;
  onSubmit: (payload: {
    amount: number;
    entry_date: string;
    entry_type: 'income' | 'expense';
    source: 'cash' | 'card' | 'app_t3' | 'expense';
    note?: string;
  },
  id?: string
  ) => Promise<void> | void;
  isSubmitting?: boolean;
}

interface FormState {
  amount: string;
  note: string;
  entry_type: 'income' | 'expense';
  source: 'cash' | 'card' | 'app_t3' | 'expense';
  entry_date: string;
}

const typeOptions = [
  { value: 'income' as const, label: 'Ingresos' },
  { value: 'expense' as const, label: 'Gastos' }
];

export function EntryFormModal({ visible, entry, onDismiss, onSubmit, isSubmitting }: EntryFormModalProps) {
  const initialState: FormState = entry
    ? {
        amount: entry.amount.toString(),
        note: entry.note ?? '',
        entry_type: entry.entry_type,
        source: entry.source,
        entry_date: entry.entry_date
      }
    : {
        amount: '',
        note: '',
        entry_type: 'income',
        source: 'cash',
        entry_date: toISODate(new Date())
      };

  const [form, setForm] = useState<FormState>(initialState);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (entry) {
        setForm({
          amount: entry.amount.toString(),
          note: entry.note ?? '',
          entry_type: entry.entry_type,
          source: entry.source,
          entry_date: entry.entry_date
        });
      } else {
        setForm({
          amount: '',
          note: '',
          entry_type: 'income',
          source: 'cash',
          entry_date: toISODate(new Date())
        });
      }
    }
  }, [visible, entry]);

  const sourceOptions = form.entry_type === 'income' ? INCOME_SOURCES : (['expense'] as const);

  function handleTypeChange(nextType: 'income' | 'expense') {
    setForm((prev) => ({
      ...prev,
      entry_type: nextType,
      source: nextType === 'income' ? 'cash' : 'expense'
    }));
  }

  function handleSourceChange(nextSource: FormState['source']) {
    setForm((prev) => ({ ...prev, source: nextSource }));
  }

  function handleSubmit() {
    const amount = Number.parseFloat(form.amount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      impactLight();
      Alert.alert('Monto inválido', 'Ingresa un número mayor a cero.');
      return;
    }

    void (async () => {
      await onSubmit(
        {
          amount,
          note: form.note.trim() ? form.note.trim() : undefined,
          entry_type: form.entry_type,
          source: form.source,
          entry_date: form.entry_date
        },
        entry?.id
      );
    })();
  }

  function handleDateChange(_: unknown, selected?: Date) {
    setShowDatePicker(false);
    if (selected) {
      setForm((prev) => ({ ...prev, entry_date: toISODate(selected) }));
    }
  }

  function renderContent() {
    return (
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.rowSpaceBetween}>
          <Text style={styles.heading}>{entry ? 'Editar movimiento' : 'Nuevo movimiento'}</Text>
          <Pressable onPress={onDismiss} hitSlop={16}>
            <MaterialCommunityIcons name="close" size={22} color={palette.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.label}>Tipo</Text>
        <SegmentedControl options={typeOptions} value={form.entry_type} onChange={handleTypeChange} />

        <Text style={styles.label}>Fuente</Text>
        <View style={styles.sourcesRow}>
          {sourceOptions.map((source) => {
            const descriptor = SOURCE_DESCRIPTORS[source];
            const active = form.source === source;
            return (
              <Pressable
                key={source}
                onPress={() => handleSourceChange(source)}
                style={[styles.sourceChip, active && { backgroundColor: descriptor.color }]}
              >
                <Text style={[styles.sourceLabel, active && styles.sourceLabelActive]}>{descriptor.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Monto</Text>
        <View style={styles.amountRow}>
          <TextInput
            keyboardType="decimal-pad"
            placeholder={formatCurrency(0).replace(/0,00|0.00/, '')}
            placeholderTextColor={palette.textSecondary}
            value={form.amount}
            onChangeText={(value) => setForm((prev) => ({ ...prev, amount: value }))}
            style={styles.amountInput}
          />
          <MaterialCommunityIcons name="cash-100" size={26} color={palette.textSecondary} />
        </View>

        <Text style={styles.label}>Fecha</Text>
        <Pressable
          style={styles.datePicker}
          onPress={() => {
            setShowDatePicker(true);
          }}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={palette.textSecondary} />
          <Text style={styles.dateText}>{form.entry_date}</Text>
        </Pressable>

        <Text style={styles.label}>Nota</Text>
        <TextInput
          multiline
          numberOfLines={3}
          placeholder="Detalle opcional"
          placeholderTextColor={palette.textSecondary}
          style={styles.noteInput}
          value={form.note}
          onChangeText={(value) => setForm((prev) => ({ ...prev, note: value }))}
        />

        <Pressable
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitLabel}>{entry ? 'Guardar cambios' : 'Agregar'}</Text>
          )}
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <Modal animationType="fade" visible={visible} transparent onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      </View>

      {showDatePicker ? (
        <DateTimePicker
          value={fromISODate(form.entry_date)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          onChange={handleDateChange}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: 'flex-end'
  },
  keyboard: {
    width: '100%'
  },
  sheet: {
    backgroundColor: palette.surfaceAlt,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '90%'
  },
  sheetContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heading: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700'
  },
  label: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  sourceChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: palette.surface,
    borderRadius: theme.radius.md
  },
  sourceLabel: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  sourceLabelActive: {
    color: '#ffffff'
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md
  },
  amountInput: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: theme.spacing.sm
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: palette.surface
  },
  dateText: {
    color: palette.textPrimary,
    fontSize: 15
  },
  noteInput: {
    backgroundColor: palette.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: palette.textPrimary,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: palette.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center'
  },
  submitLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  }
});
