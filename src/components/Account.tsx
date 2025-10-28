import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { useAwardPalette } from '../theme/awardPalette';

type Props = {
  session: Session;
};

export const Account = ({ session }: Props) => {
  const palette = useAwardPalette();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    void getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }

      const metadata = data.user?.user_metadata ?? {};
      setDisplayName(typeof metadata.display_name === 'string' ? metadata.display_name : '');
      setWebsite(typeof metadata.website === 'string' ? metadata.website : '');
      setAvatarUrl(typeof metadata.avatar_url === 'string' ? metadata.avatar_url : '');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async ({ full_name, website, avatar_url }: { full_name: string; website: string; avatar_url: string }) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: full_name.trim().length > 0 ? full_name.trim() : null,
          website: website.trim().length > 0 ? website.trim() : null,
          avatar_url: avatar_url.trim().length > 0 ? avatar_url.trim() : null,
        },
      });

      if (error) {
        throw error;
      }

      await getProfile();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.fieldBlock, styles.mt20]}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={session.user?.email ?? ''}
          editable={false}
          style={[styles.input, styles.inputDisabled, {
            borderColor: palette.border,
            backgroundColor: palette.surfaceStrong,
            color: palette.subtext,
          }]}
        />
      </View>

      <View style={styles.fieldBlock}>
        <Text style={[styles.label, { color: palette.subtext }]}>Nombre</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Tu nombre"
          style={[styles.input, { borderColor: palette.border, backgroundColor: palette.inputBg, color: palette.text }]}
          placeholderTextColor={palette.placeholder}
        />
      </View>

      <View style={styles.fieldBlock}>
        <Text style={[styles.label, { color: palette.subtext }]}>Website</Text>
        <TextInput
          value={website}
          onChangeText={setWebsite}
          placeholder="https://"
          style={[styles.input, { borderColor: palette.border, backgroundColor: palette.inputBg, color: palette.text }]}
          placeholderTextColor={palette.placeholder}
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: palette.highlight, shadowColor: palette.highlight }, loading && styles.buttonDisabled]}
        onPress={() => updateProfile({ full_name: displayName, website, avatar_url: avatarUrl })}
        disabled={loading}
        activeOpacity={0.85}
      >
  <Text style={styles.primaryButtonText}>{loading ? 'Actualizando...' : 'Actualizar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: palette.border }]}
        onPress={() => supabase.auth.signOut()}
        activeOpacity={0.85}
      >
        <Text style={[styles.secondaryButtonText, { color: palette.text }]}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 20,
    gap: 18,
  },
  mt20: {
    marginTop: 20,
  },
  fieldBlock: {
    width: '100%',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#6b7280',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputDisabled: {
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
