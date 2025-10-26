import * as Haptics from 'expo-haptics';

export async function impactLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Haptics unavailable', error);
  }
}

export async function impactMedium() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Haptics unavailable', error);
  }
}

export async function notifySuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Haptics unavailable', error);
  }
}
