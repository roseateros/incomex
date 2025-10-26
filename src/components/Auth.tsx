import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase';

type Mode = 'signIn' | 'signUp';

type FeedbackState = {
  type: 'success' | 'error';
  text: string;
} | null;

export const Auth = () => {
  const colorScheme = useColorScheme();
  const palette = useMemo(() => {
    if (colorScheme === 'dark') {
      return {
        text: '#F8FAFC',
        subtext: '#94A3B8',
        accent: '#38BDF8',
        accentSoft: 'rgba(56, 189, 248, 0.12)',
        highlight: '#6366F1',
        backgroundCard: 'rgba(15, 23, 42, 0.82)',
        border: 'rgba(148, 163, 184, 0.35)',
        inputBg: 'rgba(15, 23, 42, 0.7)',
        placeholder: 'rgba(148, 163, 184, 0.7)',
        disabled: 'rgba(148, 163, 184, 0.3)',
        successBg: 'rgba(34, 197, 94, 0.12)',
        successText: '#4ADE80',
        errorBg: 'rgba(248, 113, 113, 0.12)',
        errorText: '#F87171',
      } as const;
    }

    return {
      text: '#0F172A',
      subtext: '#475569',
      accent: '#2563EB',
      accentSoft: 'rgba(37, 99, 235, 0.12)',
      highlight: '#7C3AED',
      backgroundCard: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(148, 163, 184, 0.25)',
      inputBg: 'rgba(248, 250, 252, 0.96)',
      placeholder: '#94A3B8',
      disabled: 'rgba(148, 163, 184, 0.35)',
      successBg: 'rgba(16, 185, 129, 0.12)',
      successText: '#047857',
      errorBg: 'rgba(239, 68, 68, 0.12)',
      errorText: '#B91C1C',
    } as const;
  }, [colorScheme]);

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    if (mode === 'signIn') {
      setConfirmPassword('');
    }
  }, [mode]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    supabase.auth.startAutoRefresh();

    return () => {
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.trim().length >= 6;
  const confirmValid = mode === 'signUp' ? password === confirmPassword && confirmPassword.trim().length >= 6 : true;
  const canSubmit = !loading && emailValid && passwordValid && confirmValid;

  const gradientColors = colorScheme === 'dark'
    ? ['#020617', '#0B1120', '#1E1B4B']
    : ['#EFF6FF', '#FAFAFF', '#E0F2FE'];

  const handleSubmit = async () => {
    if (!emailValid) {
      setFeedback({ type: 'error', text: 'Introduce un correo válido.' });
      return;
    }

    if (!passwordValid) {
      setFeedback({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (!confirmValid) {
      setFeedback({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      if (mode === 'signIn') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          throw error;
        }
        setFeedback({ type: 'success', text: '¡Bienvenido de nuevo!' });
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) {
          throw error;
        }

        if (data.session) {
          setFeedback({ type: 'success', text: 'Cuenta creada correctamente. Ya puedes empezar.' });
        } else {
          setFeedback({ type: 'success', text: 'Hemos enviado un correo de verificación. Revisa tu bandeja de entrada.' });
        }

        setMode('signIn');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos completar la acción. Intenta de nuevo.';
      setFeedback({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  };

  const ModeButton = ({ value, label }: { value: Mode; label: string }) => {
    const isActive = mode === value;
    return (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => {
          setMode(value);
          setFeedback(null);
        }}
        style={[styles.modeButton, isActive && { backgroundColor: palette.accent }]}
      >
        <Text style={[styles.modeLabel, { color: isActive ? '#0F172A' : palette.subtext }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const FormField = ({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    autoComplete,
    keyboardType,
    autoCapitalize = 'none',
    returnKeyType = 'next',
    onSubmitEditing,
    trailing,
  }: {
    label: string;
    icon: keyof typeof Feather.glyphMap;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    autoComplete?: 'email' | 'password' | 'off';
    keyboardType?: 'default' | 'email-address';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    returnKeyType?: 'next' | 'done';
    onSubmitEditing?: () => void;
  trailing?: ReactNode;
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: palette.subtext }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: palette.inputBg, borderColor: palette.border }]}
      >
        <Feather name={icon} size={20} color={palette.subtext} style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.placeholder}
          secureTextEntry={secureTextEntry}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={[styles.input, { color: palette.text }]}
        />
        {trailing}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: palette.text }]}>Incomex</Text>
              <Text style={[styles.subtitle, { color: palette.subtext }]}>Gestiona tus ingresos diarios con una experiencia de alto diseño.</Text>
            </View>

            <View style={[styles.card, { backgroundColor: palette.backgroundCard, borderColor: palette.border }]}>
              <View style={[styles.modeSwitcher, { backgroundColor: palette.accentSoft, borderColor: palette.border }]}>
                <ModeButton value="signIn" label="Iniciar sesión" />
                <ModeButton value="signUp" label="Crear cuenta" />
              </View>

              {feedback ? (
                <View
                  style={[
                    styles.feedback,
                    feedback.type === 'success'
                      ? { backgroundColor: palette.successBg }
                      : { backgroundColor: palette.errorBg },
                  ]}
                >
                  <Text
                    style={{ color: feedback.type === 'success' ? palette.successText : palette.errorText }}
                  >
                    {feedback.text}
                  </Text>
                </View>
              ) : null}

              <FormField
                label="Correo electrónico"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                placeholder="nombre@empresa.com"
                autoComplete="email"
                keyboardType="email-address"
              />

              <FormField
                label="Contraseña"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                autoComplete="password"
                secureTextEntry={!showPassword}
                returnKeyType={mode === 'signUp' ? 'next' : 'done'}
                onSubmitEditing={mode === 'signUp' ? undefined : handleSubmit}
                trailing={
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={palette.subtext}
                    />
                  </TouchableOpacity>
                }
              />

              {mode === 'signUp' ? (
                <FormField
                  label="Confirmar contraseña"
                  icon="shield"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite tu contraseña"
                  autoComplete="password"
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  trailing={
                    <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                      <Feather
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={palette.subtext}
                      />
                    </TouchableOpacity>
                  }
                />
              ) : null}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: canSubmit ? palette.highlight : palette.disabled },
                ]}
                disabled={!canSubmit}
                onPress={handleSubmit}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>
                    {mode === 'signIn' ? 'Entrar a tu panel' : 'Crear cuenta'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMode((prev) => (prev === 'signIn' ? 'signUp' : 'signIn'));
                  setFeedback(null);
                }}
                style={styles.secondaryAction}
              >
                <Text style={[styles.secondaryText, { color: palette.subtext }]}> 
                  {mode === 'signIn' ? '¿Aún no tienes cuenta? Crea una en segundos.' : '¿Ya tienes una cuenta? Inicia sesión.'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  modeSwitcher: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  feedback: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryAction: {
    marginTop: 18,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 13,
  },
});
