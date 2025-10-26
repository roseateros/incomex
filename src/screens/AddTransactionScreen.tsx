import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  AppIcon,
  CalendarIcon,
  CashIcon,
  CreditCardIcon,
  SaveIcon,
  TrendDownIcon,
  TrendUpIcon,
  WalletIcon,
} from '../components/Icons';
import { Toast } from '../components/Toast';
import { darkTheme, lightTheme } from '../theme/colors';
import { transactionsService } from '../services/transactionsService';

const parseAmount = (text: string): number => {
  const cleaned = text.replace(/[^0-9,]/g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? 0 : value;
};

type ToastState = {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
};

type AddTransactionScreenProps = {
  session: Session;
};

export const AddTransactionScreen = ({ session }: AddTransactionScreenProps) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const scrollViewRef = useRef<ScrollView>(null);
  const expenseInputRef = useRef<View>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'success' });
  const [cardAmount, setCardAmount] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [appAmount, setAppAmount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTransactions = async () => {
    const card = parseAmount(cardAmount);
    const cash = parseAmount(cashAmount);
    const app = parseAmount(appAmount);
    const expense = parseAmount(expenseAmount);

    if (card === 0 && cash === 0 && app === 0 && expense === 0) {
      Alert.alert('Error', 'Debes ingresar al menos un monto.');
      return;
    }

    try {
      setIsSaving(true);
      await transactionsService.createTransactions(session.user.id, {
        date: selectedDate,
        card,
        cash,
        app,
        expense,
      });

      setCardAmount('');
      setCashAmount('');
      setAppAmount('');
      setExpenseAmount('');

      setToast({ visible: true, message: 'Guardado correctamente', type: 'success' });
    } catch (error) {
      console.error('Error al guardar transacciones', error);
      setToast({ visible: true, message: 'Error al guardar', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const onDateChange = (_: unknown, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={[styles.dateSelector, { backgroundColor: theme.surface }]}
            onPress={() => setShowDatePicker(true)}
          >
            <CalendarIcon size={24} color={theme.primary} />
            <View style={styles.dateTextContainer}>
              <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Fecha de Transacción</Text>
              <Text style={[styles.dateValue, { color: theme.text }]}>
                {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
              </Text>
            </View>
          </TouchableOpacity>

          {showDatePicker ? (
            <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />
          ) : null}

          <View style={[styles.inputsContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.sectionHeader}>
              <TrendUpIcon size={20} color={theme.success} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingresos del Día</Text>
            </View>

            <View style={styles.inputRow}>
              <CreditCardIcon size={20} color={theme.card} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Tarjeta</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceVariant, borderColor: theme.border, color: theme.success }]}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={cardAmount}
                onChangeText={setCardAmount}
              />
            </View>

            <View style={styles.inputRow}>
              <CashIcon size={20} color={theme.cash} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Efectivo</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceVariant, borderColor: theme.border, color: theme.success }]}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={cashAmount}
                onChangeText={setCashAmount}
              />
            </View>

            <View style={styles.inputRow}>
              <AppIcon size={20} color={theme.app} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>APP T3</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceVariant, borderColor: theme.border, color: theme.success }]}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={appAmount}
                onChangeText={setAppAmount}
              />
            </View>
          </View>

          <View ref={expenseInputRef} style={[styles.inputsContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.sectionHeader}>
              <WalletIcon size={20} color={theme.error} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Gastos del Día</Text>
            </View>

            <View style={styles.inputRow}>
              <TrendDownIcon size={20} color={theme.error} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Gastos</Text>
              <TextInput
                ref={(node) => {
                  if (node) {
                    // noop placeholder for future logic
                  }
                }}
                style={[styles.input, { backgroundColor: theme.surfaceVariant, borderColor: theme.border, color: theme.error }]}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                onFocus={() => {
                  expenseInputRef.current?.measureLayout(
                    scrollViewRef.current as unknown as View,
                    (_x, y) => {
                      scrollViewRef.current?.scrollTo({ y: y - 80, animated: true });
                    },
                    () => undefined,
                  );

                  setTimeout(() => {
                    expenseInputRef.current?.measureLayout(
                      scrollViewRef.current as unknown as View,
                      (_x, y) => {
                        scrollViewRef.current?.scrollTo({ y: y - 80, animated: true });
                      },
                      () => undefined,
                    );
                  }, 300);
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSaveTransactions}
            disabled={isSaving}
          >
            <SaveIcon size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar Transacciones'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  inputsContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1.5,
    minWidth: 110,
    textAlign: 'right',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
