import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from '@navigation/AppNavigator';
import { AppProviders } from '@providers/AppProviders';
import { palette } from '@theme/colors';

enableScreens();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
      <AppProviders>
        <StatusBar style="light" animated />
        <AppNavigator />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
