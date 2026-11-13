import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/haptics';
import { colors, motion, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export const TAB_BAR_HEIGHT = 66;

/** Bottom space a tab screen needs so content/FABs clear the floating bar. */
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + space.md + TAB_BAR_HEIGHT;
}

export const TABS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  index: { label: 'Home', icon: 'home-variant-outline', active: 'home-variant' },
  trips: { label: 'Trips', icon: 'bag-suitcase-outline', active: 'bag-suitcase' },
  memories: { label: 'Memories', icon: 'image-multiple-outline', active: 'image-multiple' },
  profile: { label: 'Profile', icon: 'account-circle-outline', active: 'account-circle' },
};

interface Props {
  index: number;
  routes: string[];
  onPress: (name: string) => void;
}

/** Floating pill tab bar with a sliding active indicator. */
export function TabBar({ index, routes, onPress }: Props) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const tabW = routes.length ? width / routes.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withTiming(index * tabW, { duration: motion.fast, easing: Easing.out(Easing.cubic) });
  }, [index, tabW, x]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + space.md }]} pointerEvents="box-none">
      <View style={styles.bar} onLayout={(e) => setWidth(e.nativeEvent.layout.width - space.sm * 2)}>
        {tabW > 0 && (
          <Animated.View style={[styles.indicator, { width: tabW }, indicator]}>
            <View style={styles.indicatorInner} />
          </Animated.View>
        )}
        {routes.map((name, i) => {
          const tab = TABS[name];
          if (!tab) return null;
          const on = i === index;
          return (
            <PressableScale
              key={name}
              scaleTo={0.88}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={tab.label}
              onPress={() => {
                if (!on) {
                  haptics.select();
                  onPress(name);
                }
              }}
              style={styles.tab}
            >
              <Icon name={on ? tab.active : tab.icon} size={24} color={on ? colors.accent : colors.textFaint} />
              <Text variant="label" color={on ? colors.accent : colors.textFaint} style={styles.label}>
                {tab.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.lg, right: space.lg },
  bar: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(27,31,40,0.97)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  indicator: { position: 'absolute', left: space.sm, top: 7, bottom: 7, paddingHorizontal: space.xs },
  indicatorInner: { flex: 1, borderRadius: radius.lg, backgroundColor: colors.accentSoft },
  tab: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 10, letterSpacing: 0.6 },
});
