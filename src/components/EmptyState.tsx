import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, space } from '@/theme/tokens';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface Props {
  icon: IconName;
  title: string;
  body: string;
  action?: { label: string; icon?: IconName; onPress: () => void };
  delay?: number;
}

/** Friendly empty state: floating icon in soft rings, title, body, optional CTA. */
export function EmptyState({ icon, title, body, action, delay = 150 }: Props) {
  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [bob]);
  const float = useAnimatedStyle(() => ({ transform: [{ translateY: -8 * bob.value }, { rotate: `${-4 + 8 * bob.value}deg` }] }));
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.06 * bob.value }], opacity: 0.5 + 0.5 * (1 - bob.value) }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(320)} style={styles.wrap}>
      <View style={styles.art}>
        <Animated.View style={[styles.ringOuter, ring]} />
        <View style={styles.ringInner} />
        <Animated.View style={float}>
          <Icon name={icon} size={44} color={colors.accent} />
        </Animated.View>
      </View>
      <Text variant="title" align="center">
        {title}
      </Text>
      <Text variant="body" color={colors.textDim} align="center" style={styles.body}>
        {body}
      </Text>
      {action && <Button label={action.label} icon={action.icon} onPress={action.onPress} style={styles.cta} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl, paddingHorizontal: space.xl },
  art: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  ringOuter: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: colors.accentSoft },
  ringInner: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: colors.accentSoft },
  body: { maxWidth: 300 },
  cta: { marginTop: space.md, alignSelf: 'stretch' },
});
