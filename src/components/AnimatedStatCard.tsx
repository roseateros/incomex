import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { palette, theme } from '@theme/colors';
import { formatCurrency } from '@utils/format';

interface AnimatedStatCardProps {
  title: string;
  value: number;
  footer?: ReactNode;
  colors?: [string, string];
}

export function AnimatedStatCard({ title, value, footer, colors }: AnimatedStatCardProps) {
  const scale = useSharedValue(0.95);

  useEffect(() => {
    scale.value = 0.95;
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });
  }, [value, scale]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.container, animatedStyles]}>
      <LinearGradient
        colors={colors ?? [palette.surface, palette.surfaceAlt]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{formatCurrency(value)}</Text>
        </View>
        {footer}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden'
  },
  gradient: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm
  },
  title: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3
  },
  value: {
    color: palette.textPrimary,
    fontSize: 26,
    fontWeight: '700'
  }
});
