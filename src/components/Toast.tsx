import { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

import { darkTheme, lightTheme } from '../theme/colors';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
};

export const Toast = ({ message, type, visible, onHide, duration = 2000 }: ToastProps) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(onHide);
  }, [onHide, opacity, scale, translateY]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (type === 'success') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'error') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => hide(), duration);
    return () => clearTimeout(timer);
  }, [duration, hide, opacity, scale, translateY, type, visible]);

  if (!visible) {
    return null;
  }

  const backgroundColor = type === 'success' ? theme.success : type === 'error' ? theme.error : theme.primary;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{type === 'success' ? '✓' : type === 'error' ? '✗' : 'ⓘ'}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    zIndex: 9999,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
