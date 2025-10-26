import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DailyScreen } from '@screens/DailyScreen';
import { ReportsScreen } from '@screens/ReportsScreen';
import { palette } from '@theme/colors';

const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: palette.primary,
    background: palette.background,
    card: palette.surfaceAlt,
    text: palette.textPrimary,
    border: palette.border,
    notification: palette.primary
  }
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: palette.surfaceAlt,
            borderTopColor: palette.border,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600'
          },
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.textSecondary,
          tabBarIcon: ({ color, size }) => {
            const iconName = route.name === 'Daily' ? 'calendar-today' : 'chart-arc';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Daily" component={DailyScreen} options={{ title: 'Agenda' }} />
        <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reportes' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
