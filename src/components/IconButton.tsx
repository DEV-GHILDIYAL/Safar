import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { HapticKind } from '@/lib/haptics';
import { colors } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

interface Props {
  icon: IconName;
  onPress: () => void;
  size?: number;
  color?: string;
  background?: string;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export function IconButton({ icon, onPress, size = 44, color = colors.text, background = colors.surfaceAlt, haptic = 'tap', style, accessibilityLabel, disabled }: Props) {
  return (
    <PressableScale
      haptic={disabled ? undefined : haptic}
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.88}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: background, opacity: disabled ? 0.3 : 1 }, style]}
    >
      <Icon name={icon} size={size * 0.48} color={color} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
