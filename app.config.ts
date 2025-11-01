import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const splashBackground = '#FFFFFF';

  return {
    ...config,
    name: 'incomex',
    slug: 'incomex',
    version: '1.0.5',
    orientation: 'portrait',
    icon: './assets/app_logo.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: splashBackground,
        },
      ],
    ],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'cover',
      backgroundColor: splashBackground,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.roseateros.incomex',
      icon: './assets/app_logo.png',
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'cover',
        backgroundColor: splashBackground,
      },
    },
    android: {
      package: 'com.roseateros.incomex',
      icon: './assets/app_logo.png',
      adaptiveIcon: {
        foregroundImage: './assets/app_logo.png',
        backgroundColor: splashBackground,
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      versionCode: 5,
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'cover',
        backgroundColor: splashBackground,
      },
    },
    web: {
      favicon: './assets/app_logo.png',
    },
    extra: {
      ...(config.extra ?? {}),
      eas: {
        projectId: 'a81e2316-41ad-41bc-88b9-14e812dfaba4',
      },
      supabaseUrl,
      supabaseAnonKey,
    },
  };
};
