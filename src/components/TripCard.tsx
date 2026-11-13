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
import { Pill } from './Pill';
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

function statusLabel(trip: Trip, now: number): string {
  const s = tripStatus(trip, now);
  if (s === 'upcoming') {
    const d = daysBetween(now, trip.startDate);
    return d === 1 ? 'Tomorrow' : `In ${d} days`;
  }
  if (s === 'current') return 'On the road';
  return `${tripLength(trip)} day${tripLength(trip) > 1 ? 's' : ''}`;
}

interface Props {
  trip: Trip;
  index: number;
  now: number;
}

export function TripCard({ trip, index, now }: Props) {
  const { ref, open } = useOpenTrip(trip);
  const past = tripStatus(trip, now) === 'past';
  return (
    <Animated.View entering={FadeInDown.delay(stagger(index) + 120).springify().damping(18)}>
      <PressableScale haptic="tap" onPress={open} scaleTo={0.97}>
        <View ref={ref} collapsable={false} style={[styles.card, past && styles.past]}>
          <CoverImage file={trip.cover} seed={trip.id} scrim={past ? 1.2 : 1} style={StyleSheet.absoluteFill} />
          <View style={styles.top}>
            <Pill label={statusLabel(trip, now)} live={tripStatus(trip, now) === 'current'} color={past ? colors.textDim : colors.text} />
          </View>
          <View style={styles.bottom}>
            <Text variant="title" numberOfLines={1} color={past ? colors.textDim : colors.text}>
              {trip.title}
            </Text>
            <View style={styles.meta}>
              {trip.destination ? (
                <>
                  <Icon name="map-marker" size={14} color={colors.accent} />
                  <Text variant="small" color={colors.textDim} numberOfLines={1} style={styles.flexShrink}>
                    {trip.destination}
                  </Text>
                  <Text variant="small" color={colors.textFaint}>
                    ·
                  </Text>
                </>
              ) : null}
              <Text variant="small" color={colors.textDim}>
                {formatRange(trip.startDate, trip.endDate)}
              </Text>
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  past: { height: 150 },
  top: { padding: space.lg, flexDirection: 'row' },
  bottom: { padding: space.lg, gap: space.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
  flexShrink: { flexShrink: 1 },
});
