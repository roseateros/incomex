import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View, StatusBar, Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { useFocusEffect } from '@react-navigation/native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Auth } from './src/components/Auth';
import { ResetPassword } from './src/components/ResetPassword';
import { supabase } from './src/lib/supabase';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppThemeContext, type AppTheme } from './src/theme/AppThemeContext';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authFlow, setAuthFlow] = useState<'auth' | 'reset'>('auth');
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<AppTheme>('light');

  const toggleTheme = useCallback(() => {
    setTheme((prev: AppTheme) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      // Update StatusBar immediately
      setTimeout(() => {
        StatusBar.setBarStyle(newTheme === 'dark' ? 'light-content' : 'dark-content', true);
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(newTheme === 'dark' ? '#000' : '#fff', true);
        }
      }, 0);
      return newTheme;
    });
  }, []);

  const themeContextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  // Update StatusBar when theme changes
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme === 'dark' ? '#000' : '#fff', true);
      }
    }, [theme])
  );

  const handleRecoveryLink = useCallback(
    async (url: string | null) => {
      if (!url) {
        return;
      }

      const [, fragment] = url.split('#');
      if (!fragment) {
        return;
      }

      const params = new URLSearchParams(fragment);
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (type !== 'recovery' || !accessToken || !refreshToken) {
        return;
      }

      setIsLoading(true);

      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }

        setSession(data.session);
        setResetEmail(data.session?.user?.email ?? null);
        setAuthFlow('reset');
      } catch (error) {
        console.warn('Failed to process password recovery link', error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setAuthFlow('auth');
      })
      .catch((error) => {
        console.warn('Supabase session fetch failed', error);
        // Clear invalid tokens
        if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('Refresh Token Not Found')) {
          supabase.auth.signOut();
          setSession(null);
          setAuthFlow('auth');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setResetEmail(session?.user?.email ?? null);
        setAuthFlow('reset');
        setSession(session);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setResetEmail(null);
        setAuthFlow('auth');
      }

      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        setSession(null);
        setAuthFlow('auth');
      }

      setSession(session);
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      void handleRecoveryLink(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleRecoveryLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleRecoveryLink]);

  const handleResetComplete = useCallback(() => {
    setAuthFlow('auth');
    setResetEmail(null);
  }, []);

  const handleResetCancel = useCallback(() => {
    setIsLoading(true);
    supabase.auth
      .signOut()
      .catch((error) => {
        console.warn('Supabase sign out failed', error);
      })
      .finally(() => {
        setAuthFlow('auth');
        setResetEmail(null);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? '#000' : '#fff'}
          translucent={false}
        />
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppThemeContext.Provider value={themeContextValue}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
          <StatusBar
            barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme === 'dark' ? '#000' : '#fff'}
            translucent={false}
          />
          <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
            {authFlow === 'reset' ? (
              <ResetPassword
                email={resetEmail ?? undefined}
                onComplete={handleResetComplete}
                onCancel={handleResetCancel}
              />
            ) : session && session.user ? (
                <AppNavigator session={session} />
            ) : (
              <Auth />
            )}
          </View>
        </SafeAreaView>
      </AppThemeContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
