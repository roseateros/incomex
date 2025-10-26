import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

import { supabase } from '../lib/supabase';
import { useAwardPalette } from '../theme/awardPalette';
import { AwardBackground } from './AwardBackground';

type ResetPasswordProps = {
  email?: string;
  onComplete: () => void;
  onCancel: () => void;
};

type FeedbackState = { type: 'success' | 'error'; text: string } | null;

const MIN_PASSWORD_LENGTH = 6;

export const ResetPassword = ({ email, onComplete, onCancel }: ResetPasswordProps) => {
  const palette = useAwardPalette();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const triggerNotification = useCallback((type: Haptics.NotificationFeedbackType) => {
    void Haptics.notificationAsync(type).catch(() => undefined);
  }, []);

  const validate = () => {
    if (newPassword.trim().length < MIN_PASSWORD_LENGTH) {
      setFeedback({ type: 'error', text: `Tu contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` });
      triggerNotification(Haptics.NotificationFeedbackType.Error);
      return false;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'Las contraseñas no coinciden.' });
      triggerNotification(Haptics.NotificationFeedbackType.Error);
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const trimmedPassword = newPassword.trim();

      const { error } = await supabase.auth.updateUser({
        password: trimmedPassword,
      });

      if (error) {
        throw error;
      }

      await supabase.auth.refreshSession();

      triggerNotification(Haptics.NotificationFeedbackType.Success);
      setFeedback({ type: 'success', text: 'Tu contraseña fue actualizada. ¡Bienvenido de nuevo!' });
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(onComplete, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos actualizar tu contraseña.';
      triggerNotification(Haptics.NotificationFeedbackType.Error);
      setFeedback({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  }, [confirmPassword, newPassword, onComplete, triggerNotification, validate]);

  return (
    <AwardBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: palette.cardBg, borderColor: palette.borderSoft, shadowColor: palette.highlight }]}>
            <View style={[styles.badge, { backgroundColor: palette.badgeBg, borderColor: palette.borderSoft }]}
            >
              <Feather name="lock" size={16} color={palette.accent} />
              <Text style={[styles.badgeText, { color: palette.accent }]}>Restablecer acceso</Text>
            </View>

            <Text style={[styles.title, { color: palette.text }]}>Elige tu nueva contraseña</Text>
            <Text style={[styles.subtitle, { color: palette.subtext }]}
            >
              {email ? `Actualiza la contraseña para ${email}.` : 'Introduce una nueva contraseña para continuar.'}
            </Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: palette.subtext }]}>Nueva contraseña</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={palette.placeholder}
                secureTextEntry
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.text }]}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: palette.subtext }]}>Confirmar contraseña</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                placeholderTextColor={palette.placeholder}
                secureTextEntry
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.text }]}
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
                  style={[styles.feedbackText, { color: feedback.type === 'success' ? palette.successText : palette.errorText }]}
                >
                  {feedback.text}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: palette.highlight, shadowColor: palette.highlight }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : (
                <Text style={styles.primaryButtonText}>Guardar contraseña</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              style={[styles.secondaryButton, { borderColor: palette.border }]}
              activeOpacity={0.8}
            >
              <Feather name="x" size={16} color={palette.subtext} />
              <Text style={[styles.secondaryButtonText, { color: palette.subtext }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AwardBackground>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
    gap: 18,
  },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 14, android: 10, default: 12 }),
    fontSize: 15,
    fontWeight: '500',
  },
  feedback: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  feedbackText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
