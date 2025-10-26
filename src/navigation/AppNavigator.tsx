import { useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { TouchableOpacity, useColorScheme, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { DailySummaryScreen } from '../screens/DailySummaryScreen';
import { MonthlySummaryScreen } from '../screens/MonthlySummaryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { FilterIcon, CalendarIcon, ChartIcon, PlusIcon } from '../components/Icons';
import { useAwardPalette } from '../theme/awardPalette';
import { ProfileSheet } from '../components/ProfileSheet';

const Tab = createBottomTabNavigator();

type AppNavigatorProps = {
  session: Session;
};

export const AppNavigator = ({ session }: AppNavigatorProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = useAwardPalette();
  const [profileVisible, setProfileVisible] = useState(false);

  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: palette.surface,
      card: palette.surface,
      border: palette.border,
      primary: palette.accent,
      text: palette.text,
    },
  };

  return (
    <>
      <NavigationContainer theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={palette.surface} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: {
              backgroundColor: palette.surface,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: palette.border,
            },
            headerTintColor: palette.text,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
              color: palette.text,
            },
            headerBackground: () => (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.surface, opacity: 0.94 }]} />
            ),
            headerTitleAlign: 'center',
            headerTransparent: false,
            headerShadowVisible: false,
            headerRight: () => (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Abrir perfil"
                style={[styles.profileIcon, { borderColor: palette.border, backgroundColor: palette.accentMuted }]}
                onPress={() => setProfileVisible(true)}
                activeOpacity={0.85}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="user" size={18} color={palette.accent} />
              </TouchableOpacity>
            ),
            tabBarStyle: {
              backgroundColor: palette.surface,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: palette.border,
              height: 62,
              paddingBottom: 10,
              paddingTop: 6,
            },
            tabBarActiveTintColor: palette.accent,
            tabBarInactiveTintColor: palette.subtext,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            sceneContainerStyle: {
              backgroundColor: 'transparent',
            },
            tabBarIcon: ({ color, size }) => {
              switch (route.name) {
                case 'Agregar':
                  return <PlusIcon size={size} color={color} />;
                case 'Diario':
                  return <CalendarIcon size={size} color={color} />;
                case 'Mensual':
                  return <ChartIcon size={size} color={color} />;
                case 'Reportes':
                  return <FilterIcon size={size} color={color} />;
                default:
                  return <PlusIcon size={size} color={color} />;
              }
            },
          })}
        >
        <Tab.Screen
          name="Agregar"
          options={{ headerTitle: 'Registrar Transacción' }}
        >
          {(props) => <AddTransactionScreen {...props} session={session} />}
        </Tab.Screen>
        <Tab.Screen
          name="Diario"
          options={{ headerTitle: 'Resumen Diario' }}
        >
          {(props) => <DailySummaryScreen {...props} session={session} />}
        </Tab.Screen>
        <Tab.Screen
          name="Mensual"
          options={{ headerTitle: 'Resumen Mensual' }}
        >
          {(props) => <MonthlySummaryScreen {...props} session={session} />}
        </Tab.Screen>
        <Tab.Screen
          name="Reportes"
          options={{ headerTitle: 'Reportes y Análisis' }}
        >
          {(props) => <ReportsScreen {...props} session={session} />}
        </Tab.Screen>
  </Tab.Navigator>
      </NavigationContainer>
      <ProfileSheet
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        session={session}
      />
    </>
  );
};

const styles = StyleSheet.create({
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});
