import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { palette, theme } from '@theme/colors';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <Animated.View entering={FadeInDown.delay(150)} exiting={FadeOutDown} style={styles.wrapper}>
      <Pressable style={styles.button} onPress={onPress} android_ripple={{ color: '#1e3a8a' }}>
        <MaterialCommunityIcons name="plus" size={26} color="#ffffff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12
  }
});
