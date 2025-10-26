import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Input } from '@rneui/themed';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

type Props = {
  session: Session;
};

export const Account = ({ session }: Props) => {
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
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session.user?.email ?? ''} disabled />
      </View>

      <View style={styles.verticallySpaced}>
  <Input label="Nombre" value={displayName} onChangeText={setDisplayName} />
      </View>

      <View style={styles.verticallySpaced}>
  <Input label="Website" value={website} onChangeText={setWebsite} />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ full_name: displayName, website, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
