import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

type RequiredEnv = {
  url: string;
  key: string;
};

function getEnv(): RequiredEnv {
  const extra = (Constants.expoConfig ?? (Constants as unknown as { manifest?: { extra?: Record<string, unknown> } }).manifest)?.extra ?? {};
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? (extra.supabaseUrl as string | undefined);
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (extra.supabaseAnonKey as string | undefined);

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables. Provide EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY via environment variables or app config.');
  }

  return { url, key };
}

const { url, key } = getEnv();

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
