import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { useAwardPalette } from '../theme/awardPalette';
import { useAppTheme } from '../theme/AppThemeContext';

type ProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
  session: Session;
};

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

export const ProfileSheet = ({ visible, onClose, session }: ProfileSheetProps) => {
  const palette = useAwardPalette();
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === 'dark';
  const sheetBackground = useMemo(() => {
    const color = palette.surfaceStrong || palette.surface;
    const match = color.match(/rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\)/i);
    if (!match) {
      return color;
    }

    const [, r, g, b] = match;
    return `rgb(${r}, ${g}, ${b})`;
  }, [palette.surface, palette.surfaceStrong]);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const email = session.user.email ?? '';

  const metadataDisplayName = useMemo(() => {
    const raw = session.user.user_metadata?.display_name;
    return typeof raw === 'string' ? raw : '';
  }, [session.user.user_metadata]);

  const initials = useMemo(() => {
    const source = (displayName || metadataDisplayName || email).trim();
    if (!source) {
      return 'U';
    }

    return (
      source
        .split(' ')
        .map((piece) => piece[0]?.toUpperCase() ?? '')
        .filter(Boolean)
        .slice(0, 2)
        .join('') || 'U'
    );
  }, [displayName, metadataDisplayName, email]);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      setFeedback(null);

      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }

      const latestName = data.user?.user_metadata?.display_name;
      if (typeof latestName === 'string') {
        setDisplayName(latestName);
      } else {
        setDisplayName(metadataDisplayName);
      }
    } catch (error) {
      console.error('Error loading profile', error);
      const message = error instanceof Error ? error.message : 'No pudimos cargar tu perfil.';
      setFeedback({ type: 'error', message });
      setDisplayName(metadataDisplayName);
    } finally {
      setLoadingProfile(false);
    }
  }, [metadataDisplayName]);

  useEffect(() => {
    if (visible) {
      void loadProfile();
    } else {
      setFeedback(null);
    }
  }, [visible, loadProfile]);

  const handleSave = useCallback(async () => {
    const sanitizedName = displayName.trim();

    try {
      setSaving(true);
      setFeedback(null);

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { display_name: sanitizedName.length > 0 ? sanitizedName : null },
      });

      if (metadataError) {
        console.error('Error updating user metadata', metadataError);
        throw metadataError;
      }

      setFeedback({ type: 'success', message: 'Perfil actualizado con éxito.' });
      await loadProfile();
    } catch (error) {
      console.error('Error saving profile', error);
      const message = error instanceof Error ? error.message : 'No pudimos guardar tus cambios.';
      setFeedback({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  }, [displayName, loadProfile]);

  const handleSignOut = useCallback(async () => {
    try {
      setFeedback(null);
      await supabase.auth.signOut();
      onClose();
    } catch (error) {
      console.error('Error signing out', error);
      const message = error instanceof Error ? error.message : 'No pudimos cerrar tu sesión.';
      setFeedback({ type: 'error', message });
    }
  }, [onClose]);

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <View
            style={[styles.sheet, { backgroundColor: sheetBackground, borderColor: palette.border }]}
          >
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: palette.border }]} />
            </View>

            <View style={styles.headerRow}>
              <View style={[styles.avatar, { backgroundColor: palette.accentMuted }]}>
                <Text style={[styles.avatarText, { color: palette.accent }]}>{initials}</Text>
              </View>

              <View style={styles.headerInfo}>
                <Text style={[styles.headerTitle, { color: palette.text }]} numberOfLines={1}>
                  {displayName.trim().length > 0 ? displayName : metadataDisplayName || 'Bienvenido'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: palette.subtext }]} numberOfLines={1}>
                  {email}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: palette.surfaceStrong }]}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Feather name="x" size={20} color={palette.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: palette.subtext }]}>Nombre para mostrar</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Ej. Studio Incomex"
                  placeholderTextColor={palette.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: palette.surfaceStrong,
                      borderColor: palette.border,
                      color: palette.text,
                    },
                  ]}
                  autoCapitalize="words"
                  returnKeyType="done"
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
                    style={[
                      styles.feedbackText,
                      { color: feedback.type === 'success' ? palette.successText : palette.errorText },
                    ]}
                  >
                    {feedback.message}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.preferenceItem, { borderColor: palette.border }]}>
                <View style={styles.preferenceInfo}>
                  <View style={[styles.preferenceIcon, { backgroundColor: palette.accentMuted }]}>
                    <Feather name={isDark ? 'moon' : 'sun'} size={16} color={palette.accent} />
                  </View>
                  <View>
                    <Text style={[styles.preferenceTitle, { color: palette.text }]}>Modo oscuro</Text>
                    <Text style={[styles.preferenceSubtitle, { color: palette.subtext }]}>
                      {isDark
                        ? 'Activado para fondos profundos y texto claro.'
                        : 'Desactivado para un estilo luminoso.'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: palette.borderSoft, true: palette.highlight }}
                  thumbColor={isDark ? '#FFFFFF' : '#F1F5F9'}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: palette.highlight, shadowColor: palette.highlight },
                ]}
                onPress={handleSave}
                disabled={saving || loadingProfile}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.destructiveButton,
                  { borderColor: palette.errorBg, backgroundColor: palette.errorBg },
                ]}
                onPress={handleSignOut}
                activeOpacity={0.85}
              >
                <View style={[styles.preferenceIcon, { backgroundColor: 'transparent' }]}>
                  <Feather name="log-out" size={16} color={palette.errorText} />
                </View>
                <Text style={[styles.destructiveText, { color: palette.errorText }]}>Cerrar sesión</Text>
                <Feather name="chevron-right" size={16} color={palette.errorText} />
              </TouchableOpacity>
            </ScrollView>

            {loadingProfile ? (
              <View style={[styles.loadingCover, { backgroundColor: palette.surface }]}>
                <ActivityIndicator color={palette.accent} />
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 7, 15, 0.6)',
  },
  keyboard: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
  },
  closeButton: {
    padding: 6,
    borderRadius: 999,
  },
  content: {
    paddingBottom: 12,
    gap: 18,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 14, android: 10, default: 12 }),
    fontSize: 16,
    fontWeight: '500',
  },
  feedback: {
    borderRadius: 14,
    padding: 14,
  },
  feedbackText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 16,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  preferenceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  preferenceSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  destructiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 16,
  },
  destructiveText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  loadingCover: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.88,
  },
});
