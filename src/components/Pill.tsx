import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface Props {
  label: string;
  color?: string;
  background?: string;
  icon?: IconName;
  /** Pulsing live dot. */
  live?: boolean;
}

export function Pill({ label, color = colors.text, background = 'rgba(10,12,16,0.6)', icon, live }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      {live && <LiveDot color={color} />}
      {icon && <Icon name={icon} size={13} color={color} />}
      <Text variant="label" color={color}>
        {label}
      </Text>
    </View>
  );
}

export function LiveDot({ color = colors.accent, size = 8 }: { color?: string; size?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false);
  }, [p]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - p.value), transform: [{ scale: 1 + p.value * 1.6 }] }));
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: size, backgroundColor: color }, ring]} />
      <View style={[StyleSheet.absoluteFill, { borderRadius: size, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs + 2,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
  },
});
