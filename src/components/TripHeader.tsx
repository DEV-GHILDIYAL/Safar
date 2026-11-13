import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { daysBetween, formatRange, tripLength, tripStatus } from '@/lib/dates';
import { takeOrigin } from '@/lib/transition';
import { colors, space } from '@/theme/tokens';
import type { Trip } from '@/types';
import { CoverImage } from './CoverImage';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { Pill } from './Pill';
import { Text } from './Text';

export const HEADER_H = 380;

/** Collapsing cover header. Grows out of the tapped trip card (shared-element style) on entry. */
export function TripHeader({ trip, scrollY, now }: { trip: Trip; scrollY: SharedValue<number>; now: number }) {
  const { width } = useWindowDimensions();
  const [origin] = useState(() => takeOrigin(trip.id));
  const p = useSharedValue(origin ? 0 : 1);

  useEffect(() => {
    if (origin) p.value = withSpring(1, { damping: 22, stiffness: 170, mass: 0.9 });
  }, [origin, p]);

  const frame = useAnimatedStyle(() => {
    if (!origin) return { left: 0, top: 0, width, height: HEADER_H, borderRadius: 0 };
    const t = p.value;
    return {
      left: origin.x * (1 - t),
      top: origin.y * (1 - t),
      width: origin.width + (width - origin.width) * t,
      height: origin.height + (HEADER_H - origin.height) * t,
      borderRadius: 28 * (1 - Math.min(t, 1)),
    };
  });
  const parallax = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(0, scrollY.value) * 0.5 }, { scale: 1 + Math.max(0, -scrollY.value) / 400 }],
  }));
  const content = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HEADER_H * 0.5], [1, 0], 'clamp') * interpolate(p.value, [0.55, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(scrollY.value, [0, HEADER_H], [0, -50], 'clamp') }],
  }));

  const status = tripStatus(trip, now);
  const pill =
    status === 'current'
      ? `Day ${daysBetween(trip.startDate, now) + 1} of ${tripLength(trip)}`
      : status === 'upcoming'
        ? `In ${daysBetween(now, trip.startDate)} day${daysBetween(now, trip.startDate) === 1 ? '' : 's'}`
        : 'Memory lane';

  return (
    // zIndex keeps the growing frame above the content that follows it during the entry transition.
    <View style={{ height: HEADER_H, zIndex: 2 }}>
      <Animated.View style={[styles.frame, frame]}>
        <Animated.View style={[StyleSheet.absoluteFill, parallax]}>
          <CoverImage file={trip.cover} seed={trip.id} scrim={1.15} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[styles.content, content]}>
          <Pill label={pill} live={status === 'current'} color={status === 'current' ? colors.accent : colors.text} />
          <Text variant="display" numberOfLines={2}>
            {trip.title}
          </Text>
          <View style={styles.meta}>
            {trip.destination ? <Meta icon="map-marker" text={trip.destination} /> : null}
            <Meta icon="calendar-range" text={formatRange(trip.startDate, trip.endDate)} />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={15} color={colors.accent} />
      <Text variant="small" color={colors.textDim} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

interface BarProps {
  title: string;
  scrollY: SharedValue<number>;
  actions: { icon: IconName; onPress: () => void; label: string }[];
}

/** Floating top bar: transparent over the cover, turns solid with the title once the header collapses. */
export function TripTopBar({ title, scrollY, actions }: BarProps) {
  const insets = useSafeAreaInsets();
  const bg = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [HEADER_H - 200, HEADER_H - 110], [0, 1], 'clamp') }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HEADER_H - 150, HEADER_H - 90], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(scrollY.value, [HEADER_H - 150, HEADER_H - 90], [10, 0], 'clamp') }],
  }));
  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.sm }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.barBg, bg]} />
      <IconButton icon="arrow-left" onPress={() => router.back()} background={colors.scrim} accessibilityLabel="Back" />
      <Animated.View style={[styles.barTitle, titleStyle]}>
        <Text variant="heading" numberOfLines={1}>
          {title}
        </Text>
      </Animated.View>
      {actions.map((a) => (
        <IconButton key={a.icon} icon={a.icon} onPress={a.onPress} background={colors.scrim} accessibilityLabel={a.label} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { position: 'absolute', overflow: 'hidden', backgroundColor: colors.surface },
  content: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.xl, gap: space.sm },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.lg, rowGap: space.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  barBg: { backgroundColor: colors.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  barTitle: { flex: 1, paddingHorizontal: space.xs },
});
