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
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    void getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;
      if (!user) {
        throw new Error('No user on the session.');
      }

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async ({ username, website, avatar_url }: { username: string | null; website: string | null; avatar_url: string | null }) => {
    try {
      setLoading(true);
      const { user } = session;
      if (!user) {
        throw new Error('No user on the session.');
      }

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) {
        throw error;
      }
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
        <Input label="Username" value={username ?? ''} onChangeText={setUsername} />
      </View>

      <View style={styles.verticallySpaced}>
        <Input label="Website" value={website ?? ''} onChangeText={setWebsite} />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
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
