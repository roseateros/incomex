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
  Animated,
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

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'success' });
  const [cardAmount, setCardAmount] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [appAmount, setAppAmount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Animation for loading dots
  const dotOpacity = useRef(new Animated.Value(0.3)).current;

  const animateLoadingDots = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSaveTransactions = async () => {
    const card = parseAmount(cardAmount);
    const cash = parseAmount(cashAmount);
    const app = parseAmount(appAmount);
    const expense = parseAmount(expenseAmount);

    if (card === 0 && cash === 0 && app === 0 && expense === 0) {
      setToast({ visible: true, message: 'Ingresa al menos un monto', type: 'error' });
      return;
    }

    setIsSaving(true);
    animateLoadingDots();

    try {
      const payload = {
        date: selectedDate,
        card: card > 0 ? card : undefined,
        cash: cash > 0 ? cash : undefined,
        app: app > 0 ? app : undefined,
        expense: expense > 0 ? expense : undefined,
      };

      await transactionsService.createTransactions(session.access_token, payload);
      
      setCardAmount('');
      setCashAmount('');
      setAppAmount('');
      setExpenseAmount('');
      setToast({ visible: true, message: 'Transacciones guardadas exitosamente', type: 'success' });
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
          >
              {/* Date Selector - Transparent */}
              <TouchableOpacity
                style={[styles.dateCard, { backgroundColor: 'transparent', borderColor: palette.borderSoft }]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.85}
              >
                <CalendarIcon size={20} color={palette.accent} />
                <Text style={[styles.dateText, { color: palette.text }]}>
                  {format(selectedDate, "d MMM yyyy", { locale: es })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />
              )}

              {/* Income Section - Transparent background */}
              <View style={[styles.sectionCard, { backgroundColor: 'transparent', borderColor: palette.borderSoft }]}>
                <View style={styles.sectionHeader}>
                  <TrendUpIcon size={18} color={palette.positive} />
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>Ingresos</Text>
                </View>
                
                <View style={styles.tripleRow}>
                  <View style={styles.tripleItem}>
                    <View style={[styles.iconContainer, { backgroundColor: palette.accentMuted }]}>
                      <CreditCardIcon size={14} color={palette.accent} />
                    </View>
                    <Text style={[styles.tripleLabel, { color: palette.subtext }]}>Tarjeta</Text>
                    <TextInput
                      style={[styles.attractiveInput, { backgroundColor: palette.inputBg, color: palette.positive }]}
                      placeholder="0"
                      placeholderTextColor={palette.placeholder}
                      keyboardType="decimal-pad"
                      value={cardAmount}
                      onChangeText={setCardAmount}
                      onFocus={scrollToBottom}
                    />
                  </View>
                  
                  <View style={styles.tripleItem}>
                    <View style={[styles.iconContainer, { backgroundColor: palette.successBg }]}>
                      <CashIcon size={14} color={palette.positive} />
                    </View>
                    <Text style={[styles.tripleLabel, { color: palette.subtext }]}>Efectivo</Text>
                    <TextInput
                      style={[styles.attractiveInput, { backgroundColor: palette.inputBg, color: palette.positive }]}
                      placeholder="0"
                      placeholderTextColor={palette.placeholder}
                      keyboardType="decimal-pad"
                      value={cashAmount}
                      onChangeText={setCashAmount}
                      onFocus={scrollToBottom}
                    />
                  </View>

                  <View style={styles.tripleItem}>
                    <View style={[styles.iconContainer, { backgroundColor: palette.pillBg }]}>
                      <AppIcon size={14} color={palette.highlight} />
                    </View>
                    <Text style={[styles.tripleLabel, { color: palette.subtext }]}>APP T3</Text>
                    <TextInput
                      style={[styles.attractiveInput, { backgroundColor: palette.inputBg, color: palette.positive }]}
                      placeholder="0"
                      placeholderTextColor={palette.placeholder}
                      keyboardType="decimal-pad"
                      value={appAmount}
                      onChangeText={setAppAmount}
                      onFocus={scrollToBottom}
                    />
                  </View>
                </View>
              </View>

              {/* Expense Section - Transparent background */}
              <View style={[styles.sectionCard, { backgroundColor: 'transparent', borderColor: palette.borderSoft }]}>
                <View style={styles.sectionHeader}>
                  <TrendDownIcon size={18} color={palette.negative} />
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>Gastos</Text>
                </View>
                
                <View style={styles.singleRow}>
                  <View style={[styles.iconContainer, { backgroundColor: palette.errorBg }]}>
                    <WalletIcon size={16} color={palette.negative} />
                  </View>
                  <Text style={[styles.inputLabel, { color: palette.subtext }]}>Total Gastos</Text>
                  <TextInput
                    style={[styles.attractiveInput, { backgroundColor: palette.inputBg, color: palette.negative, minWidth: 120 }]}
                    placeholder="0"
                    placeholderTextColor={palette.placeholder}
                    keyboardType="decimal-pad"
                    value={expenseAmount}
                    onChangeText={setExpenseAmount}
                    onFocus={scrollToBottom}
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.modernSaveButton, 
                  { 
                    backgroundColor: palette.accent,
                    opacity: isSaving ? 0.6 : 1
                  }
                ]}
                onPress={handleSaveTransactions}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                <View style={styles.saveButtonContent}>
                  <SaveIcon size={16} color="#FFFFFF" />
                  <Text style={[styles.saveButtonText, { color: "#FFFFFF" }]}>
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Text>
                </View>
                {isSaving && (
                  <View style={styles.loadingIndicator}>
                    <Animated.Text style={[styles.loadingDots, { opacity: dotOpacity, color: "#FFFFFF" }]}>
                      ●●●
                    </Animated.Text>
                  </View>
                )}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 12,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
    flex: 1,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
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
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  tripleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tripleItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  singleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  tripleLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  modernInput: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    textAlign: 'center',
    minWidth: 80,
  },
  attractiveInput: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 0,
    textAlign: 'center',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  modernSaveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -8,
  },
  loadingDots: {
    fontSize: 10,
    fontWeight: '900',
  },
});