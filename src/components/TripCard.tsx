import { router } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { daysBetween, formatRange, tripLength, tripStatus } from '@/lib/dates';
import { setOrigin } from '@/lib/transition';
import { colors, radius, space, stagger } from '@/theme/tokens';
import type { Trip } from '@/types';
import { CoverImage } from './CoverImage';
import { Icon } from './Icon';
import { LiveDot } from './Pill';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

/** Navigates to trip detail, recording the card rect for the shared-element style transition. */
export function useOpenTrip(trip: Trip) {
  const ref = useRef<View>(null);
  const open = () => {
    const go = () => router.push(`/trip/${trip.id}`);
    if (!ref.current) return go();
    ref.current.measureInWindow((x, y, width, height) => {
      if (width > 0) setOrigin({ tripId: trip.id, x, y, width, height });
      go();
    });
  };
  return { ref, open };
}

export function statusText(trip: Trip, now: number): { text: string; color: string; live: boolean } {
  const s = tripStatus(trip, now);
  if (s === 'current') return { text: 'On the road', color: colors.accent, live: true };
  if (s === 'upcoming') {
    const d = daysBetween(now, trip.startDate);
    return { text: d === 1 ? 'Tomorrow' : `In ${d} days`, color: colors.text, live: false };
  }
  const len = tripLength(trip);
  return { text: `${len} day${len > 1 ? 's' : ''}`, color: colors.textFaint, live: false };
}

interface Props {
  trip: Trip;
  index: number;
  now: number;
}

/** Compact, scannable trip row: cover thumb, title, place + dates, status. */
export function TripCard({ trip, index, now }: Props) {
  const { ref, open } = useOpenTrip(trip);
  const status = statusText(trip, now);
  const past = tripStatus(trip, now) === 'past';
  return (
    <Animated.View entering={FadeInDown.delay(stagger(index, 45) + 100).springify().damping(18)}>
      <PressableScale haptic="tap" onPress={open} scaleTo={0.97}>
        <View ref={ref} collapsable={false} style={styles.card}>
          <CoverImage file={trip.cover} seed={trip.id} style={[styles.thumb, past && styles.dim]} />
          <View style={styles.body}>
            <Text variant="heading" numberOfLines={1} color={past ? colors.textDim : colors.text}>
              {trip.title}
            </Text>
            {trip.destination ? (
              <View style={styles.meta}>
                <Icon name="map-marker" size={13} color={colors.accent} />
                <Text variant="small" color={colors.textDim} numberOfLines={1} style={styles.shrink}>
                  {trip.destination}
                </Text>
              </View>
            ) : null}
            <Text variant="small" color={colors.textFaint} numberOfLines={1}>
              {formatRange(trip.startDate, trip.endDate)}
            </Text>
          </View>
          <View style={styles.side}>
            <View style={styles.status}>
              {status.live && <LiveDot size={7} />}
              <Text variant="label" color={status.color} style={styles.statusText}>
                {status.text}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.textFaint} />
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  thumb: { width: 72, height: 72, borderRadius: radius.md },
  dim: { opacity: 0.6 },
  body: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  shrink: { flexShrink: 1 },
  side: { alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch', paddingVertical: space.xs },
  status: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 1 },
  statusText: { fontSize: 10 },
});
