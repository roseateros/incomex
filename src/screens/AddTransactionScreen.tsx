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
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { useAwardPalette } from '../theme/awardPalette';
import { AwardBackground } from '../components/AwardBackground';

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
  const palette = useAwardPalette();

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
    <AwardBackground>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <TouchableOpacity
            style={[styles.dateSelector, { backgroundColor: palette.surface, borderColor: palette.border }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.85}
          >
            <CalendarIcon size={24} color={palette.accent} />
            <View style={styles.dateTextContainer}>
              <Text style={[styles.dateLabel, { color: palette.subtext }]}>Fecha de Transacción</Text>
              <Text style={[styles.dateValue, { color: palette.text }]}>
                {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
              </Text>
            </View>
          </TouchableOpacity>

          {showDatePicker ? (
            <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />
          ) : null}

          <View style={[styles.inputsContainer, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={styles.sectionHeader}>
              <TrendUpIcon size={20} color={palette.positive} />
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Ingresos del Día</Text>
            </View>

            <View style={styles.inputRow}>
              <CreditCardIcon size={20} color={palette.accent} />
              <Text style={[styles.inputLabel, { color: palette.text }]}>Tarjeta</Text>
              <TextInput
                style={[styles.input, { backgroundColor: palette.surfaceStrong, borderColor: palette.border, color: palette.positive }]}
                placeholder="0.00"
                placeholderTextColor={palette.placeholder}
                keyboardType="decimal-pad"
                value={cardAmount}
                onChangeText={setCardAmount}
              />
            </View>

            <View style={styles.inputRow}>
              <CashIcon size={20} color={palette.positive} />
              <Text style={[styles.inputLabel, { color: palette.text }]}>Efectivo</Text>
              <TextInput
                style={[styles.input, { backgroundColor: palette.surfaceStrong, borderColor: palette.border, color: palette.positive }]}
                placeholder="0.00"
                placeholderTextColor={palette.placeholder}
                keyboardType="decimal-pad"
                value={cashAmount}
                onChangeText={setCashAmount}
              />
            </View>

            <View style={styles.inputRow}>
              <AppIcon size={20} color={palette.highlight} />
              <Text style={[styles.inputLabel, { color: palette.text }]}>APP T3</Text>
              <TextInput
                style={[styles.input, { backgroundColor: palette.surfaceStrong, borderColor: palette.border, color: palette.positive }]}
                placeholder="0.00"
                placeholderTextColor={palette.placeholder}
                keyboardType="decimal-pad"
                value={appAmount}
                onChangeText={setAppAmount}
              />
            </View>
          </View>

          <View
            ref={expenseInputRef}
            style={[styles.inputsContainer, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <View style={styles.sectionHeader}>
              <WalletIcon size={20} color={palette.negative} />
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Gastos del Día</Text>
            </View>

            <View style={styles.inputRow}>
              <TrendDownIcon size={20} color={palette.negative} />
              <Text style={[styles.inputLabel, { color: palette.text }]}>Gastos</Text>
              <TextInput
                ref={(node) => {
                  if (node) {
                    // noop placeholder for future logic
                  }
                }}
                style={[styles.input, { backgroundColor: palette.surfaceStrong, borderColor: palette.border, color: palette.negative }]}
                placeholder="0.00"
                placeholderTextColor={palette.placeholder}
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
            style={[styles.saveButton, { backgroundColor: palette.accent, shadowColor: palette.accent }]}
            onPress={handleSaveTransactions}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <SaveIcon size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar Transacciones'}</Text>
          </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
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
    borderWidth: 1,
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
    borderWidth: 1,
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
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
