import { useCallback, useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

import { darkTheme, lightTheme } from '../theme/colors';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmColor?: string;
};

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  confirmColor,
}: ConfirmDialogProps) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animateOut = useCallback(
    (callback: () => void) => {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(callback);
    },
    [opacity, scale],
  );

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.3);
      opacity.setValue(0);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);

  const handleConfirm = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateOut(onConfirm);
  };

  const handleCancel = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateOut(onCancel);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleCancel}>
        <Animated.View
          style={[
            styles.dialog,
            { backgroundColor: theme.surface, transform: [{ scale }], opacity },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.surfaceVariant }]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: confirmColor ?? theme.error }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
