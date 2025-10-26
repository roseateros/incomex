import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { TouchableOpacity, Text, useColorScheme } from 'react-native';

import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { DailySummaryScreen } from '../screens/DailySummaryScreen';
import { MonthlySummaryScreen } from '../screens/MonthlySummaryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { FilterIcon, CalendarIcon, ChartIcon, PlusIcon } from '../components/Icons';
import { supabase } from '../lib/supabase';

const Tab = createBottomTabNavigator();

type AppNavigatorProps = {
  session: Session;
};

export const AppNavigator = ({ session }: AppNavigatorProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: isDark ? '#0F1419' : '#F5F5F5',
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? '#0F1419' : '#16213E'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: '#16213E',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#2C2C3E',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: '#16213E',
            borderTopWidth: 1,
            borderTopColor: '#2C2C3E',
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: '#95A5A6',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => supabase.auth.signOut()} style={{ paddingHorizontal: 16 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Salir</Text>
            </TouchableOpacity>
          ),
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
  );
};
