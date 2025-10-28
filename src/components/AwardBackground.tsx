import type { ReactNode } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getAwardBackground, getAwardGlows } from '../theme/awardPalette';
import { useAppTheme } from '../theme/AppThemeContext';

type AwardBackgroundProps = {
  children: ReactNode;
};

export const AwardBackground = ({ children }: AwardBackgroundProps) => {
  const { theme } = useAppTheme();
  const scheme = useColorScheme();
  const resolvedScheme = theme ?? scheme ?? 'light';
  const background = getAwardBackground(resolvedScheme);
  const { primary, secondary } = getAwardGlows(resolvedScheme);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={primary}
        style={[styles.glow, styles.glowPrimary]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={secondary}
        style={[styles.glow, styles.glowSecondary]}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.9,
  },
  glowPrimary: {
    top: -120,
    right: -80,
  },
  glowSecondary: {
    bottom: -140,
    left: -90,
  },
});
