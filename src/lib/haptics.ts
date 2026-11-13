import * as Haptics from 'expo-haptics';

const safe = (p: Promise<unknown>) => {
  p.catch(() => {});
};

export const haptics = {
  tap: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  press: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  select: () => safe(Haptics.selectionAsync()),
  success: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warn: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};

export type HapticKind = keyof typeof haptics;
