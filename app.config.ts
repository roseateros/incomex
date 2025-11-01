import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const splashBackground = '#050A1E';

  return {
    ...config,
    name: 'incomex',
    slug: 'incomex',
    version: '1.0.3',
    orientation: 'portrait',
    icon: './assets/logo.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    plugins: [
      'react-native-google-mobile-ads'
    ],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'cover',
      backgroundColor: splashBackground,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.roseateros.incomex',
      icon: './assets/logo.png',
      googleServicesFile: './GoogleService-Info.plist',
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'cover',
        backgroundColor: splashBackground,
      },
    },
    android: {
      package: 'com.roseateros.incomex',
      icon: './assets/logo.png',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: splashBackground,
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      versionCode: 3,
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'cover',
        backgroundColor: splashBackground,
      },
    },
    web: {
  favicon: './assets/logo.png',
    },
    extra: {
      ...(config.extra ?? {}),
      eas: {
        projectId: 'a81e2316-41ad-41bc-88b9-14e812dfaba4',
      },
      supabaseUrl,
      supabaseAnonKey,
      googleMobileAdsAppId: 'ca-app-pub-9831692105789559~4243265868',
    },
  };
};
