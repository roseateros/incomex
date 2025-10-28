import { useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { DailySummaryScreen } from '../screens/DailySummaryScreen';
import { MonthlySummaryScreen } from '../screens/MonthlySummaryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { FilterIcon, CalendarIcon, ChartIcon, PlusIcon } from '../components/Icons';
import { useAwardPalette, getAwardBackground } from '../theme/awardPalette';
import { ProfileSheet } from '../components/ProfileSheet';
import { useAppTheme } from '../theme/AppThemeContext';

const Tab = createBottomTabNavigator();

type AppNavigatorProps = {
  session: Session;
};

export const AppNavigator = ({ session }: AppNavigatorProps) => {
  const { theme: currentTheme } = useAppTheme();
  const isDark = currentTheme === 'dark';
  const palette = useAwardPalette();
  const [profileVisible, setProfileVisible] = useState(false);
  const tabBackgroundGradient = getAwardBackground(currentTheme);
  const tabOverlay = isDark ? 'rgba(2, 6, 23, 0.78)' : 'rgba(255, 255, 255, 0.86)';

  const navigationTheme = {
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
      <NavigationContainer theme={navigationTheme}>
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
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
              height: 62,
              paddingBottom: 10,
              paddingTop: 6,
            },
            tabBarBackground: () => (
              <View style={StyleSheet.absoluteFill}>
                <LinearGradient
                  colors={tabBackgroundGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: tabOverlay }]} />
              </View>
            ),
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
