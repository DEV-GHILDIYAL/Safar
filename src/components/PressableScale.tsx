import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { haptics, type HapticKind } from '@/lib/haptics';
import { motion } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE = Easing.out(Easing.quad);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: HapticKind;
}

/** Pressable with a subtle scale-down on press (no bounce) and optional haptic. */
export function PressableScale({ scaleTo = 0.97, haptic, onPress, onPressIn, onPressOut, onLongPress, style, children, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: motion.press, easing: EASE });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: motion.release, easing: EASE });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) haptics[haptic]();
        onPress?.(e);
      }}
      onLongPress={
        onLongPress
          ? (e) => {
              haptics.press();
              onLongPress(e);
            }
          : undefined
      }
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}
