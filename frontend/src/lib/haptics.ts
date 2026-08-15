import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Subtle, paper-like haptic vocabulary for Codexia & Ink.
 * Avoids buzzy, gamified vibrations.
 */
export const haptics = {
  tap: () => {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {});
  },
  press: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  pen: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
  },
  complete: () => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  transition: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
};
