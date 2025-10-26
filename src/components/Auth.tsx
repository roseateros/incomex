import { useCallback, useEffect, useState } from 'react';
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase';
import { useAwardPalette } from '../theme/awardPalette';
import type { AwardPalette } from '../theme/awardPalette';
import { AwardBackground } from './AwardBackground';

type Mode = 'signIn' | 'signUp';
type FeedbackState = { type: 'success' | 'error'; text: string } | null;

type ModeButtonProps = {
  value: Mode;
  label: string;
  isActive: boolean;
  palette: AwardPalette;
  onPress: (value: Mode) => void;
};

const ModeButton = ({ value, label, isActive, palette, onPress }: ModeButtonProps) => (
  <TouchableOpacity
    accessibilityRole="button"
    activeOpacity={0.85}
    onPress={() => onPress(value)}
    style={[
      styles.modeButton,
      {
        backgroundColor: isActive ? palette.highlight : 'transparent',
        shadowOpacity: isActive ? 0.18 : 0,
      },
    ]}
  >
    <Text
      style={[
        styles.modeLabel,
        { color: isActive ? '#FDF4FF' : palette.subtext },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

type FormFieldProps = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  palette: AwardPalette;
  secureTextEntry?: boolean;
  autoComplete?: 'email' | 'password' | 'off';
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  trailing?: ReactNode;
};

const FormField = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  palette,
  secureTextEntry,
  autoComplete,
  keyboardType,
  autoCapitalize = 'none',
  returnKeyType = 'next',
  onSubmitEditing,
  trailing,
}: FormFieldProps) => (
  <View style={styles.fieldContainer}>
    <Text style={[styles.fieldLabel, { color: palette.subtext }]}>{label}</Text>
    <View
      style={[
        styles.inputWrapper,
        { backgroundColor: palette.inputBg, borderColor: palette.border },
      ]}
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

export const Auth = () => {
  const palette = useAwardPalette();

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.trim().length >= 6;
  const confirmValid = mode === 'signUp' ? password === confirmPassword && confirmPassword.trim().length >= 6 : true;
  const canSubmit = !loading && emailValid && passwordValid && confirmValid;

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
        setFeedback({ type: 'success', text: '¡Bienvenido de nuevo! Tu panel te espera.' });
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) {
          throw error;
        }

        if (data.session) {
          setFeedback({ type: 'success', text: 'Cuenta creada. Vamos a diseñar tu ritmo financiero.' });
        } else {
          setFeedback({ type: 'success', text: 'Te enviamos un correo de verificación para activar tu cuenta.' });
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

  const handleModeChange = useCallback((value: Mode) => {
    setMode(value);
    setFeedback(null);
  }, []);

  return (
    <AwardBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: 'height' })}
          keyboardVerticalOffset={Platform.select({ ios: 24, android: 0 }) ?? 0}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.hero}>
              <View style={[styles.badge, { backgroundColor: palette.badgeBg, borderColor: palette.borderSoft }]}
              >
                <Feather name="star" size={14} color={palette.accent} />
                <Text style={[styles.badgeText, { color: palette.accent }]}>Incomex</Text>
              </View>

            <Text style={[styles.title, { color: palette.text }]}>Tu contabilidad, clara y al día</Text>
              <Text style={[styles.subtitle, { color: palette.subtext }]}>Simplifica tu gestión diaria como taxista. Incomex facilita registros y te libera del caos de hojas y libros contables.</Text>
            </View>

            <View style={[styles.formCard, { backgroundColor: palette.cardBg, borderColor: palette.border }]}
            >
              <View style={[styles.modeSwitcher, { backgroundColor: palette.accentMuted, borderColor: palette.borderSoft }]}
              >
                <ModeButton
                  value="signIn"
                  label="Iniciar sesión"
                  isActive={mode === 'signIn'}
                  palette={palette}
                  onPress={handleModeChange}
                />
                <ModeButton
                  value="signUp"
                  label="Crear cuenta"
                  isActive={mode === 'signUp'}
                  palette={palette}
                  onPress={handleModeChange}
                />
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
                label="Correo profesional"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                placeholder="nombre@estudio.com"
                autoComplete="email"
                keyboardType="email-address"
                palette={palette}
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
                palette={palette}
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
                  palette={palette}
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
                    {mode === 'signIn' ? 'Entrar a mi flujo' : 'Diseñar mi cuenta'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMode((prev) => (prev === 'signIn' ? 'signUp' : 'signIn'));
                  setFeedback(null);
                }}
                style={styles.secondaryAction}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryText, { color: palette.subtext }]}
                >
                  {mode === 'signIn'
                    ? '¿Eres nuevo? Crea una cuenta en segundos.'
                    : '¿Ya formas parte de Incomex? Vuelve a iniciar sesión.'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footnote}>
              <Text style={[styles.footnoteText, { color: palette.subtext }]}>Desarrollado por Roshan Gautam</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AwardBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 32,
    flexGrow: 1,
  },
  hero: {
    marginTop: 16,
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 32,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  modeSwitcher: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    marginBottom: 26,
  },
  modeButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  feedback: {
    borderRadius: 18,
    padding: 12,
    marginBottom: 18,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  secondaryAction: {
    marginTop: 14,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 12,
    lineHeight: 16,
  },
  footnote: {
    marginTop: 28,
    alignItems: 'center',
  },
  footnoteText: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
